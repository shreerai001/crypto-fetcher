import {SecretsManagerClient, GetSecretValueCommand} from "@aws-sdk/client-secrets-manager";

export class SecretsManagerUtil {

    private constructor() {}

    public static async getSecret(secretName: Readonly<string>): Promise<string> {
        const secretsClient = new SecretsManagerClient({});
        try {
            const secret = await secretsClient.send(
                new GetSecretValueCommand({SecretId: secretName})
            );
            return secret.SecretString || "";
        } catch (error) {
            console.error(`Failed to retrieve secret (${secretName}):`, error);
            throw new Error(`Unable to retrieve secret: ${secretName}`);
        }
    }
}