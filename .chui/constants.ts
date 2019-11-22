import {Config, interpolate} from "@pulumi/pulumi";
import {Chui} from "@chuistack/chui-lib";

const chui = Chui.Config.loadCurrentConfig();
const appName = Chui.Config.getCurrentAppName();

const config = new Config();

/***********************
 * IAM                 *
 ***********************/

export const IAM_DATABASE_RELEASE_NAME = Chui.Resource.buildObjectName(chui.globalAppName, 'iam', 'db');
export const IAM_DATABASE_USERNAME = `postgres`;
export const IAM_DATABASE_PASSWORD = interpolate`${config.requireSecret("iamDbPassword")}`;
export const IAM_DATABASE_NAME = `keycloak`;
export const IAM_DATABASE_HOSTNAME = Chui.Resource.getHostnameForServiceName(`${IAM_DATABASE_RELEASE_NAME}-postgresql`);

export const KEYCLOAK_RELEASE_NAME = Chui.Resource.buildObjectName(chui.globalAppName, 'iam', 'keycloak');
export const KEYCLOAK_ADMIN_PASSWORD = config.requireSecret("iamAdminPassword");
export const KEYCLOAK_ADMIN_USER = config.require("iamAdminUser");
export const KEYCLOAK_ENDPOINT = Chui.Resource.buildEndpoint(chui.rootDomain, appName);
export const KEYCLOAK_TLS_SECRET = Chui.Resource.buildObjectName(chui.globalAppName, KEYCLOAK_RELEASE_NAME, "tls-secret");
