import { GraphqlConfig } from './common/configs/config.interface';
import { ConfigService } from '@nestjs/config';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  constructor(private configService: ConfigService) {}
  createGqlOptions(): ApolloDriverConfig {
    const graphqlConfig =
      this.configService.get<GraphqlConfig>('config.graphql');
    return {
      // schema options
      autoSchemaFile: graphqlConfig.schemaDestination || './src/schema.graphql',
      sortSchema: graphqlConfig.sortSchema,
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      // subscription
      installSubscriptionHandlers: true,
      includeStacktraceInErrorResponses: graphqlConfig.debug,
      playground: graphqlConfig.playgroundEnabled,
      context: ({ req }) => ({ req }),
    };
  }
}
