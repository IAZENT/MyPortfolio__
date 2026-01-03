import find from './find';
import update from './update';
import deleteOperation from './delete';
import create from './create';
import login from '../../auth/operations/login';
import refresh from '../../auth/operations/refresh';
import findByID from './findByID';
import updateByID from './updateByID';
import deleteByID from './deleteByID';
import { TypeWithID } from '../config/types';
import forgotPassword from '../../auth/operations/forgotPassword';
export type AfterOperationMap<T extends TypeWithID> = {
    create: typeof create;
    find: typeof find<T>;
    findByID: typeof findByID<T>;
    update: typeof update;
    updateByID: typeof updateByID;
    delete: typeof deleteOperation;
    deleteByID: typeof deleteByID;
    login: typeof login;
    refresh: typeof refresh;
    forgotPassword: typeof forgotPassword;
};
export type AfterOperationArg<T extends TypeWithID> = {
    operation: 'create';
    result: Awaited<ReturnType<AfterOperationMap<T>['create']>>;
    args: Parameters<AfterOperationMap<T>['create']>[0];
} | {
    operation: 'find';
    result: Awaited<ReturnType<AfterOperationMap<T>['find']>>;
    args: Parameters<AfterOperationMap<T>['find']>[0];
} | {
    operation: 'findByID';
    result: Awaited<ReturnType<AfterOperationMap<T>['findByID']>>;
    args: Parameters<AfterOperationMap<T>['findByID']>[0];
} | {
    operation: 'update';
    result: Awaited<ReturnType<AfterOperationMap<T>['update']>>;
    args: Parameters<AfterOperationMap<T>['update']>[0];
} | {
    operation: 'updateByID';
    result: Awaited<ReturnType<AfterOperationMap<T>['updateByID']>>;
    args: Parameters<AfterOperationMap<T>['updateByID']>[0];
} | {
    operation: 'delete';
    result: Awaited<ReturnType<AfterOperationMap<T>['delete']>>;
    args: Parameters<AfterOperationMap<T>['delete']>[0];
} | {
    operation: 'deleteByID';
    result: Awaited<ReturnType<AfterOperationMap<T>['deleteByID']>>;
    args: Parameters<AfterOperationMap<T>['deleteByID']>[0];
} | {
    operation: 'login';
    result: Awaited<ReturnType<AfterOperationMap<T>['login']>>;
    args: Parameters<AfterOperationMap<T>['login']>[0];
} | {
    operation: 'refresh';
    result: Awaited<ReturnType<AfterOperationMap<T>['refresh']>>;
    args: Parameters<AfterOperationMap<T>['refresh']>[0];
} | {
    operation: 'forgotPassword';
    result: Awaited<ReturnType<AfterOperationMap<T>['forgotPassword']>>;
    args: Parameters<AfterOperationMap<T>['forgotPassword']>[0];
};
export declare const buildAfterOperation: <T extends TypeWithID = any, O extends keyof AfterOperationMap<T> = keyof AfterOperationMap<T>>(operationArgs: AfterOperationArg<T> & {
    operation: O;
}) => Promise<Awaited<ReturnType<AfterOperationMap<T>[O]>>>;
