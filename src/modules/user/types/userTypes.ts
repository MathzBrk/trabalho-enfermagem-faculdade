import { PaginationParams } from "@shared/interfaces/pagination";
import { UserFilterParams } from "@shared/interfaces/user";

export interface GetUsersQueryParams extends PaginationParams, UserFilterParams {}