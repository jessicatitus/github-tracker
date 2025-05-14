import { gql } from 'apollo-server';

const typeDefs = gql`
  type Repository {
    id: ID!
    name: String!
    owner: String!
    url: String!
    description: String
    latestRelease: Release
  }

  type Release {
    id: ID!
    version: String!
    releaseDate: String!
    releaseNotes: String
    seen: Boolean!
  }

  type Query {
    repositories: [Repository!]!
  }

  type Mutation {
    addRepository(owner: String!, name: String!): Repository
    markAsSeen(repoId: ID!): Boolean
    refreshRepository(repoId: ID!): Repository
    removeRepository(repoId: ID!): Boolean
  }
`;

export default typeDefs;