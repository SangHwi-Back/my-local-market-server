import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { ProductImage } from './product-image.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload/:productId')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('productId') productId: string,
  ): Promise<ProductImage> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.imagesService.saveImage(file, +productId);
  }

  @Get('product/:productId')
  async findByProductId(
    @Param('productId') productId: string,
  ): Promise<ProductImage[]> {
    return this.imagesService.findByProductId(+productId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductImage> {
    const image = await this.imagesService.findOne(+id);
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return image;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const image = await this.imagesService.findOne(+id);
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return this.imagesService.remove(+id);
  }
}
