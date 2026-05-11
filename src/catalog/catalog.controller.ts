import { Body, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { SearchDto } from './catalog.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { APIKeyGuard } from 'src/shared/guard/api-key-guard';
import { APIUsageInterceptor } from 'src/shared/interceptor/api-usage.interceptor';
import { NotFoundErrorResponseDto, UnauthorizedErrorResponseDto } from 'src/shared/interface/error-response.dto';

@ApiTags('Catalog')
@Controller('api/catalog')
export class CatalogController {

  constructor(
    private collectionService: CatalogService
  ) { }

  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Get all collections', description: 'Returns a list of all available STAC collections' })
  @ApiResponse({ status: 200, description: 'List of STAC collections' })
  @ApiResponse({ status: 401, description: 'Invalid API key', type: UnauthorizedErrorResponseDto })
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  @Get('collections')
  getCollections() {
    return this.collectionService.getCollections();
  }

  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Get a collection by ID', description: 'Returns a single STAC collection by its ID' })
  @ApiParam({ name: 'collectionId', description: 'Collection identifier', example: 'cosmos' })
  @ApiResponse({ status: 200, description: 'STAC collection' })
  @ApiResponse({ status: 401, description: 'Invalid API key', type: UnauthorizedErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not found', type: NotFoundErrorResponseDto })
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  @Get('collections/:collectionId')
  getCollection(@Param('collectionId') collectionId: string) {
    return this.collectionService.getCollection(collectionId);
  }

  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Get items in a collection', description: 'Returns a paginated list of STAC items in the specified collection' })
  @ApiParam({ name: 'collectionId', description: 'Collection identifier', example: 'cosmos' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of item per page (max 100)', example: 10 })
  @ApiResponse({ status: 200, description: 'STAC collection' })
  @ApiResponse({ status: 401, description: 'Invalid API key', type: UnauthorizedErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not found', type: NotFoundErrorResponseDto })
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  @Get('collections/:collectionId/items')
  getItems(@Param('collectionId') collectionId: string, @Query('page') page = 1, @Query('limit') limit = 10) {
    if (limit > 100) limit = 100;
    return this.collectionService.getItems(collectionId, page, limit);
  }

  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Get a single item', description: 'Returns a single STAC item by its ID' })
  @ApiParam({ name: 'collectionId', description: 'Collection identifier', example: 'cosmos' })
  @ApiParam({ name: 'itemId', description: 'Item identifier', example: 'COSMOS_2026042201_SM_SLC_VV_20260422100000_20260422100025' })
  @ApiResponse({ status: 200, description: 'STAC collection' })
  @ApiResponse({ status: 401, description: 'Invalid API key', type: UnauthorizedErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not found', type: NotFoundErrorResponseDto })
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  @Get('collections/:collectionId/items/:itemId')
  getItem(@Param('collectionId') collectionId: string, @Param('itemId') itemId: string) {
    return this.collectionService.getItem(collectionId, itemId);
  }

  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Search STAC item (POST)', description: `Search items using spatial, temporal and property filters.
    
**Filter**
- 'bbox': Bounding box [minLon, minLat, maxLon, maxLat]
- 'datetime': Single datetime or range (start/end seperated by)
- 'collections': Collection IDs to search in
- 'ids': Item IDs (ignores other filters)
- 'intersects': GeoJON geometry to intersect
- 'query': Property filters with operators (eq, neq, gt, gte, lt, lte, in)
- 'sortby': Sort fields and directions
- 'limit': Item per page (max 100)
- 'page': Page number
` })
  @ApiBody({ type: SearchDto })
  @ApiResponse({ status: 201, description: 'GeoJSON FeatureCollection' })
  @ApiResponse({ status: 401, description: 'Invalid API key', type: UnauthorizedErrorResponseDto })
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  @Post('search')
  search(@Body() dto: SearchDto) {
    return this.collectionService.search(dto);
  }

  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Search STAC items (GET)', description: 'Search items query parameters' })
  @ApiQuery({ name: 'bbox', required: false, description: 'Bounding box as comma-separated values', example: '126.9,37.4,127.1,37.6' })
  @ApiQuery({ name: 'datetime', required: false, description: 'Datetime or range separated by /', example: '2026-04-22T00:00:00Z/2026-04-22T00:00:10Z' })
  @ApiQuery({ name: 'collections', required: false, description: 'Comma-separated collection IDs', example: 'cosmos' })
  @ApiQuery({ name: 'ids', required: false, description: 'Comma-seperated item IDs', example: 'COSMOS_2026042201_SM_SLC_VV_20260422100000_20260422100025' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiResponse({ status: 200, description: 'STAC collection' })
  @ApiResponse({ status: 401, description: 'Invalid API key', type: UnauthorizedErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not found', type: NotFoundErrorResponseDto })
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  @Get('search')
  searchGet(
    @Query('bbox') bboxStr?: string,
    @Query('datetime') datetime?: string,
    @Query('collections') collectionsStr?: string,
    @Query('ids') idsStr?: string,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    return this.collectionService.search({
      bbox: bboxStr ? bboxStr.split(',').map(Number) : undefined,
      datetime,
      collections: collectionsStr ? collectionsStr.split(',') : undefined,
      ids: idsStr ? idsStr.split(',') : undefined,
      limit: +limit,
      page: +page
    });
  }
}
