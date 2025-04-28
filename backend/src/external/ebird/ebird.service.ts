import {
  Injectable,
  Logger,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface EbirdTaxon {
  sciName: string;
  speciesCode: string;
  // Add other fields if needed later
}

@Injectable()
export class EbirdService implements OnModuleInit {
  private readonly logger = new Logger(EbirdService.name);
  private readonly ebirdApiKey: string;
  private taxonomyCache: EbirdTaxon[] | null = null;
  private taxonomyLastFetched: Date | null = null;
  private readonly TAXONOMY_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // Cache for 24 hours

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('NEXT_PUBLIC_EBIRD_KEY');
    if (!apiKey) {
      this.logger.error('NEXT_PUBLIC_EBIRD_KEY is not configured in .env');
      throw new Error('eBird API key is missing');
    }
    this.ebirdApiKey = apiKey;
  }

  async onModuleInit() {
    // Pre-fetch taxonomy on startup, but don't block startup
    this.fetchAndCacheTaxonomy().catch((error) => {
      this.logger.error('Initial eBird taxonomy fetch failed', error.stack);
    });
  }

  private async fetchAndCacheTaxonomy(): Promise<EbirdTaxon[]> {
    this.logger.log('Fetching eBird taxonomy...');
    const url = `https://api.ebird.org/v2/ref/taxonomy/ebird`;
    try {
      const response = await firstValueFrom(
        this.httpService.get<EbirdTaxon[]>(url, {
          params: {
            fmt: 'json',
            cat: 'species', // Only fetch species
          },
          headers: { 'X-eBirdApiToken': this.ebirdApiKey },
        }),
      );
      this.taxonomyCache = response.data;
      this.taxonomyLastFetched = new Date();
      this.logger.log(
        `Successfully fetched and cached ${this.taxonomyCache.length} eBird taxa.`,
      );
      return this.taxonomyCache;
    } catch (error) {
      this.logger.error(
        `Failed to fetch eBird taxonomy: ${error.message}`,
        error.response?.data,
      );
      throw new InternalServerErrorException('Could not fetch eBird taxonomy');
    }
  }

  private async getTaxonomy(): Promise<EbirdTaxon[]> {
    const now = new Date();
    if (
      !this.taxonomyCache ||
      !this.taxonomyLastFetched ||
      now.getTime() - this.taxonomyLastFetched.getTime() >
        this.TAXONOMY_CACHE_TTL_MS
    ) {
      this.logger.log('Taxonomy cache stale or empty, re-fetching...');
      return this.fetchAndCacheTaxonomy();
    }
    this.logger.log('Returning cached eBird taxonomy.');
    return this.taxonomyCache;
  }

  async convertSciNameToCodes(sciNames: string[]): Promise<string[]> {
    if (!sciNames || sciNames.length === 0) return [];
    this.logger.log(
      `Converting ${sciNames.length} scientific names to eBird codes.`,
    );

    try {
      const taxonomy = await this.getTaxonomy();
      const sciNameMap = new Map<string, string>();
      taxonomy.forEach((taxon) =>
        sciNameMap.set(taxon.sciName, taxon.speciesCode),
      );

      const codes = sciNames
        .map((name) => sciNameMap.get(name)) // Look up code in Map
        .filter((code): code is string => !!code); // Filter out null/undefined and type guard

      this.logger.log(
        `Converted ${sciNames.length} names to ${codes.length} codes.`,
      );
      return codes;
    } catch (error) {
      this.logger.error(
        `Failed during scientific name conversion: ${error.message}`,
        error.stack,
      );
      // Depending on requirements, could return empty array or rethrow
      throw new InternalServerErrorException(
        'Failed to convert scientific names to codes',
      );
    }
  }
}
