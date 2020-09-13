import { APIClient } from 'shared';
import { getAccessToken } from './Storage';

export const api = new APIClient('', getAccessToken);
