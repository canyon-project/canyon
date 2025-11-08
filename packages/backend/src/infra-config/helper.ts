import { ENV_INVALID_DATA_ENCRYPTION_KEY } from '../errors';
import { PrismaService } from '../prisma/prisma.service';
import { decrypt } from '../utils';

export enum ServiceStatus {
  ENABLE = 'ENABLE',
  DISABLE = 'DISABLE',
}

/**
 * Load environment variables from the database and set them in the process
 *
 * @Description Fetch the 'infra_config' table from the database and return it as an object
 * (ConfigModule will set the environment variables in the process)
 */
export async function loadInfraConfiguration() {
  try {
    const prisma = new PrismaService();
    const infraConfigs = await prisma.infraConfig.findMany();
    const environmentObject: Record<string, string> = {};
    infraConfigs.forEach((infraConfig) => {
      if (infraConfig.isEncrypted) {
        environmentObject[infraConfig.name] = decrypt(infraConfig.value);
      } else {
        environmentObject[infraConfig.name] = infraConfig.value;
      }
    });

    return { INFRA: environmentObject };
  } catch (error) {
    if (error.code === 'ERR_OSSL_BAD_DECRYPT')
      throw new Error(ENV_INVALID_DATA_ENCRYPTION_KEY);

    // Prisma throw error if 'Can't reach at database server' OR 'Table does not exist'
    // Reason for not throwing error is, we want successful build during 'postinstall' and generate dist files
    console.error('Error from loadInfraConfiguration', error);
    return { INFRA: {} };
  }
}
