import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const PUBLIC_ROUTE_METADATA_KEY = 'IsPublicRoute';
export const PublicRoute = (): CustomDecorator<string> => {
  return SetMetadata(PUBLIC_ROUTE_METADATA_KEY, true);
};
