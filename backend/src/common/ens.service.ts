import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

@Injectable()
export class EnsService {
  private readonly logger = new Logger(EnsService.name);
  private readonly mainnetProvider: ethers.JsonRpcProvider;
  private readonly sepoliaProvider: ethers.JsonRpcProvider;
  private readonly currentNetwork: string;

  constructor(private readonly configService: ConfigService) {
    // Determine current network from environment
    this.currentNetwork = this.configService.get<string>('ETHEREUM_NETWORK') || 'mainnet';
    
    // Setup mainnet provider for ENS resolution
    const alchemyKey = this.configService.get<string>('ALCHEMY_API_KEY');
    const infuraKey = this.configService.get<string>('INFURA_API_KEY');
    
    let mainnetRpcUrl = this.configService.get<string>('ETHEREUM_MAINNET_RPC_URL');
    
    // Try Alchemy if we have a valid key
    if (!mainnetRpcUrl && alchemyKey && alchemyKey !== 'yourAlchemyKey' && alchemyKey.length > 10) {
      mainnetRpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`;
    }
    
    // Try Infura if we have a valid key
    if (!mainnetRpcUrl && infuraKey && infuraKey !== 'yourInfuraProjectId' && infuraKey.length > 10) {
      mainnetRpcUrl = `https://mainnet.infura.io/v3/${infuraKey}`;
    }
    
    // Fallback to public providers
    if (!mainnetRpcUrl) {
      // Use the provider that worked in our tests
      mainnetRpcUrl = 'https://ethereum-rpc.publicnode.com';
    }

    this.mainnetProvider = new ethers.JsonRpcProvider(mainnetRpcUrl);

    // Setup Sepolia provider
    let sepoliaRpcUrl = this.configService.get<string>('ETHEREUM_SEPOLIA_RPC_URL');
    
    // Try Alchemy if we have a valid key
    if (!sepoliaRpcUrl && alchemyKey && alchemyKey !== 'yourAlchemyKey' && alchemyKey.length > 10) {
      sepoliaRpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`;
    }
    
    // Try Infura if we have a valid key
    if (!sepoliaRpcUrl && infuraKey && infuraKey !== 'yourInfuraProjectId' && infuraKey.length > 10) {
      sepoliaRpcUrl = `https://sepolia.infura.io/v3/${infuraKey}`;
    }
    
    // Fallback to public providers
    if (!sepoliaRpcUrl) {
      sepoliaRpcUrl = 'https://sepolia.gateway.tenderly.co'; // Alternative Sepolia RPC that should work better
    }

    this.sepoliaProvider = new ethers.JsonRpcProvider(sepoliaRpcUrl);

    this.logger.log(`ENS Service initialized for network: ${this.currentNetwork}`);
    this.logger.log(`Mainnet RPC: ${mainnetRpcUrl}`);
    this.logger.log(`Sepolia RPC: ${sepoliaRpcUrl}`);
  }

  /**
   * Resolve ENS name to wallet address
   * @param ensName - The ENS name (e.g., 'vitalik.eth')
   * @param network - Optional network preference ('mainnet' | 'sepolia')
   * @returns The resolved wallet address or null if not found
   */
  async resolveEnsToAddress(ensName: string, network?: 'mainnet' | 'sepolia'): Promise<string | null> {
    try {
      if (!ensName || !ensName.endsWith('.eth')) {
        return null;
      }

      // Try mainnet first (primary ENS network)
      try {
        const address = await this.mainnetProvider.resolveName(ensName);
        if (address) {
          this.logger.debug(`Resolved ENS ${ensName} to ${address} on mainnet`);
          return address;
        }
      } catch (mainnetError) {
        this.logger.debug(`Mainnet ENS resolution failed for ${ensName}: ${mainnetError.message}`);
      }

      // If specified network is Sepolia or mainnet failed, try Sepolia
      if (network === 'sepolia' || !network) {
        try {
          const address = await this.sepoliaProvider.resolveName(ensName);
          if (address) {
            this.logger.debug(`Resolved ENS ${ensName} to ${address} on Sepolia`);
            return address;
          }
        } catch (sepoliaError) {
          this.logger.debug(`Sepolia ENS resolution failed for ${ensName}: ${sepoliaError.message}`);
        }
      }

      return null;
    } catch (error) {
      this.logger.warn(`Failed to resolve ENS name ${ensName}: ${error.message}`);
      return null;
    }
  }

  /**
   * Reverse resolve wallet address to ENS name
   * @param address - The wallet address (0x...)
   * @param network - Optional network preference ('mainnet' | 'sepolia')
   * @returns The ENS name or null if not found
   */
  async resolveAddressToEns(address: string, network?: 'mainnet' | 'sepolia'): Promise<string | null> {
    try {
      if (!address || !ethers.isAddress(address)) {
        return null;
      }

      // Try mainnet first (primary ENS network)
      try {
        const ensName = await this.mainnetProvider.lookupAddress(address);
        if (ensName) {
          this.logger.debug(`Resolved address ${address} to ENS ${ensName} on mainnet`);
          return ensName;
        }
      } catch (mainnetError) {
        this.logger.debug(`Mainnet reverse ENS resolution failed for ${address}: ${mainnetError.message}`);
      }

      // If specified network is Sepolia or mainnet failed, try Sepolia
      if (network === 'sepolia' || !network) {
        try {
          const ensName = await this.sepoliaProvider.lookupAddress(address);
          if (ensName) {
            this.logger.debug(`Resolved address ${address} to ENS ${ensName} on Sepolia`);
            return ensName;
          }
        } catch (sepoliaError) {
          this.logger.debug(`Sepolia reverse ENS resolution failed for ${address}: ${sepoliaError.message}`);
        }
      }

      return null;
    } catch (error) {
      this.logger.debug(`No ENS name found for address ${address}: ${error.message}`);
      return null;
    }
  }

  /**
   * Resolve multiple addresses to ENS names in batch
   * @param addresses - Array of wallet addresses
   * @returns Object mapping addresses to ENS names (or null if not found)
   */
  async batchResolveAddressesToEns(addresses: string[]): Promise<Record<string, string | null>> {
    const results: Record<string, string | null> = {};

    // Process addresses in parallel with a reasonable concurrency limit
    const chunks = this.chunkArray(addresses, 10); // Process 10 at a time
    
    for (const chunk of chunks) {
      const promises = chunk.map(async (address) => {
        const ensName = await this.resolveAddressToEns(address);
        return { address, ensName };
      });

      const chunkResults = await Promise.all(promises);
      chunkResults.forEach(({ address, ensName }) => {
        results[address] = ensName;
      });
    }

    return results;
  }

  /**
   * Get ENS metadata for an address (name, avatar, description, etc.)
   * @param address - The wallet address
   * @param network - Optional network preference ('mainnet' | 'sepolia')
   * @returns ENS metadata object
   */
  async getEnsMetadata(address: string, network?: 'mainnet' | 'sepolia'): Promise<{
    name: string | null;
    avatar: string | null;
    description: string | null;
    url: string | null;
    twitter: string | null;
    github: string | null;
    network: string | null;
  }> {
    try {
      // Try to get ENS name from both networks
      const ensName = await this.resolveAddressToEns(address, network);
      
      if (!ensName) {
        return {
          name: null,
          avatar: null,
          description: null,
          url: null,
          twitter: null,
          github: null,
          network: null,
        };
      }

      // Try mainnet first for metadata
      let resolver: any = null;
      let resolverNetwork: string | null = null;

      try {
        resolver = await this.mainnetProvider.getResolver(ensName);
        resolverNetwork = 'mainnet';
      } catch (mainnetError) {
        this.logger.debug(`Mainnet resolver failed for ${ensName}: ${mainnetError.message}`);
        
        // Try Sepolia if mainnet fails
        try {
          resolver = await this.sepoliaProvider.getResolver(ensName);
          resolverNetwork = 'sepolia';
        } catch (sepoliaError) {
          this.logger.debug(`Sepolia resolver failed for ${ensName}: ${sepoliaError.message}`);
        }
      }

      if (!resolver) {
        return {
          name: ensName,
          avatar: null,
          description: null,
          url: null,
          twitter: null,
          github: null,
          network: resolverNetwork,
        };
      }

      // Get various text records
      const [avatar, description, url, twitter, github] = await Promise.allSettled([
        resolver.getAvatar().catch(() => null),
        resolver.getText('description').catch(() => null),
        resolver.getText('url').catch(() => null),
        resolver.getText('com.twitter').catch(() => null),
        resolver.getText('com.github').catch(() => null),
      ]);

      return {
        name: ensName,
        avatar: avatar.status === 'fulfilled' ? avatar.value : null,
        description: description.status === 'fulfilled' ? description.value : null,
        url: url.status === 'fulfilled' ? url.value : null,
        twitter: twitter.status === 'fulfilled' ? twitter.value : null,
        github: github.status === 'fulfilled' ? github.value : null,
        network: resolverNetwork,
      };
    } catch (error) {
      this.logger.warn(`Failed to get ENS metadata for ${address}: ${error.message}`);
      return {
        name: null,
        avatar: null,
        description: null,
        url: null,
        twitter: null,
        github: null,
        network: null,
      };
    }
  }

  /**
   * Utility function to chunk an array into smaller arrays
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Validate if a string is a valid ENS name
   * @param name - The potential ENS name
   * @returns boolean indicating if it's a valid ENS format
   */
  isValidEnsName(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }

    // Basic ENS validation: ends with .eth and contains valid characters
    const ensRegex = /^[a-z0-9-]+\.eth$/i;
    return ensRegex.test(name);
  }

  /**
   * Format address with ENS name if available
   * @param address - Wallet address
   * @param ensName - Optional ENS name
   * @param network - Network where ENS was resolved
   * @returns Formatted string
   */
  formatAddressWithEns(address: string, ensName?: string | null, network?: string | null): {
    address: string;
    ensName: string | null;
    displayName: string;
    network: string | null;
  } {
    return {
      address,
      ensName: ensName || null,
      displayName: ensName || `${address.slice(0, 6)}...${address.slice(-4)}`,
      network: network || null,
    };
  }

  /**
   * Get current network configuration
   */
  getCurrentNetwork(): string {
    return this.currentNetwork;
  }

  /**
   * Get network-specific provider
   */
  getProvider(network: 'mainnet' | 'sepolia'): ethers.JsonRpcProvider {
    return network === 'sepolia' ? this.sepoliaProvider : this.mainnetProvider;
  }

  /**
   * Test network connectivity
   */
  async testNetworkConnectivity(): Promise<{
    mainnet: { connected: boolean; blockNumber?: number; error?: string };
    sepolia: { connected: boolean; blockNumber?: number; error?: string };
  }> {
    const results = {
      mainnet: { connected: false, blockNumber: undefined, error: undefined } as any,
      sepolia: { connected: false, blockNumber: undefined, error: undefined } as any,
    };

    // Test mainnet
    try {
      const mainnetBlockNumber = await this.mainnetProvider.getBlockNumber();
      results.mainnet = { connected: true, blockNumber: mainnetBlockNumber };
    } catch (error) {
      results.mainnet = { connected: false, error: error.message };
    }

    // Test sepolia
    try {
      const sepoliaBlockNumber = await this.sepoliaProvider.getBlockNumber();
      results.sepolia = { connected: true, blockNumber: sepoliaBlockNumber };
    } catch (error) {
      results.sepolia = { connected: false, error: error.message };
    }

    return results;
  }
}