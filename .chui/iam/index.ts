import * as database from "./database";
import * as k8s from "@pulumi/kubernetes";
import {
    IAM_DATABASE_HOSTNAME,
    IAM_DATABASE_NAME,
    IAM_DATABASE_PASSWORD,
    IAM_DATABASE_USERNAME,
    KEYCLOAK_ADMIN_PASSWORD,
    KEYCLOAK_ADMIN_USER,
    KEYCLOAK_ENDPOINT,
    KEYCLOAK_RELEASE_NAME,
    KEYCLOAK_TLS_SECRET,
} from "../constants";
import {getStack, ResourceOptions, StackReference} from "@pulumi/pulumi";
import {Chui} from "@chuistack/chui-lib";

const chui = Chui.Config.loadCurrentConfig();

const configureKeycloak = ({
    dependsOn,
}: ResourceOptions) => {
    return new k8s.helm.v2.Chart(
        KEYCLOAK_RELEASE_NAME,
        {
            "repo": "codecentric",
            "chart": "keycloak",
            "version": "5.1.7",
            "values": {
                "keycloak": {
                    "username": KEYCLOAK_ADMIN_USER,
                    "password": KEYCLOAK_ADMIN_PASSWORD,
                    "persistence": {
                        "dbVendor": "postgres",
                        "dbName": IAM_DATABASE_NAME,
                        "dbHost": IAM_DATABASE_HOSTNAME,
                        "dbPort": "5432",
                        "dbUser": IAM_DATABASE_USERNAME,
                        "dbPassword": IAM_DATABASE_PASSWORD,
                    },
                    "ingress": {
                        "enabled": true,
                        "annotations": {
                            ...INGRESS_CLASS_ANNOTATION,
                            ...(
                                chui.environment === "production" ?
                                    PRODUCTION_CLUSTER_ISSUER_ANNOTATION :
                                    STAGING_CLUSTER_ISSUER_ANNOTATION
                            ),
                        },
                        "hosts": [
                            KEYCLOAK_ENDPOINT,
                        ],
                        "tls": [
                            {
                                "hosts": [
                                    KEYCLOAK_ENDPOINT
                                ],
                                "secretName": KEYCLOAK_TLS_SECRET,
                            }
                        ]
                    }
                }
            },
        },
        {
            dependsOn,
        }
    );
};

export const install = () => {
    const iamDatabaseOutput = database.install();
    const iamKeycloakOutput = configureKeycloak({
        dependsOn: [
            iamDatabaseOutput.database,
        ]
    });
    return {
        iamDatabaseOutput,
        iamKeycloakOutput,
    };
};