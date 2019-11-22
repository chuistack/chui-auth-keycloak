import * as k8s from "@pulumi/kubernetes";
import {IAM_DATABASE_NAME, IAM_DATABASE_PASSWORD, IAM_DATABASE_RELEASE_NAME, IAM_DATABASE_USERNAME} from "../constants";


/**
 * Setup a simple postgres database to back Keycloak.
 */
export const install = () => {
    const database = new k8s.helm.v2.Chart(
        IAM_DATABASE_RELEASE_NAME,
        {
            "repo": "stable",
            "chart": "postgresql",
            "version": "6.3.4",
            "values": {
                "postgresqlUsername": IAM_DATABASE_USERNAME,
                "postgresqlPassword": IAM_DATABASE_PASSWORD,
                "postgresqlDatabase": IAM_DATABASE_NAME,
                "persistence": {
                    "size": "1Gi"
                },
                "replication": {
                    "enabled": true,
                    "slaveReplicas": 2,
                    "synchronousCommit": "on",
                    "numSynchronousReplicas": 1,
                },
                "resources": {
                    "requests": {
                        "memory": "128Mi",
                        "cpu": "60m"
                    }
                },
            },
        },
    );

    return {
        database,
    };
};