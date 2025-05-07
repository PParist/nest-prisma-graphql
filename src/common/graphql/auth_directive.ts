import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

export function authDirectiveTransformer(schema: GraphQLSchema): GraphQLSchema {
  const jwtService = new JwtService({});
  const directiveName = 'auth';

  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(
        schema,
        fieldConfig,
        directiveName,
      )?.[0];

      if (!authDirective) {
        return fieldConfig;
      }

      const { rule } = authDirective;

      const { resolve = defaultFieldResolver } = fieldConfig;

      fieldConfig.resolve = async function (source, args, context, info) {
        const request = context.req;
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new UnauthorizedException('Invalid token');
        }

        const token = authHeader.substring(7);

        try {
          const decodedToken = jwtService.decode(token);

          if (!decodedToken) {
            throw new UnauthorizedException('Invalid token');
          }

          const role = decodedToken['role'] || 'user';

          const user = {
            userUuid: decodedToken['userUuid'],
            email: decodedToken['email'],
            role: role,
          };

          request.user = user;

          if (
            rule &&
            ['ADMIN', 'USER', 'GUEST'].includes(String(rule).toUpperCase())
          ) {
            const ruleValue = String(rule).toLowerCase();

            switch (ruleValue) {
              case 'admin':
                if (role !== 'admin') {
                  return null;
                }
                break;
              case 'user':
                if (role !== 'user' && role !== 'admin') {
                  return null;
                }
                break;
              case 'guest':
                if (source.ownerId !== user.userUuid && role !== 'admin') {
                  return null;
                }
                break;
            }
          } else {
            throw new Error(`Invalid rule value: ${rule}`);
          }

          return resolve(source, args, context, info);
        } catch (error) {
          console.error('Error processing token:', error.message);
          return null;
        }
      };

      return fieldConfig;
    },
  });
}
