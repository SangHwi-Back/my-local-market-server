import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from './product-image.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(ProductImage)
    private imagesRepository: Repository<ProductImage>,
  ) {
    // Create an uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  async saveImage(
    file: Express.Multer.File,
    productId: number,
  ): Promise<ProductImage> {
    const image = this.imagesRepository.create({
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      product: { id: productId },
    });

    return this.imagesRepository.save(image);
  }

  async findByProductId(productId: number): Promise<ProductImage[]> {
    return this.imagesRepository.find({
      where: { product: { id: productId } },
    });
  }

  async findOne(id: number): Promise<ProductImage | null> {
    return this.imagesRepository.findOne({
      where: { id },
      relations: ['product'],
    });
  }

  async remove(id: number): Promise<void> {
    const image = await this.findOne(id);
    if (image && fs.existsSync(image.path)) {
      fs.unlinkSync(image.path);
    }
    await this.imagesRepository.delete(id);
  }
}
