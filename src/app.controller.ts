import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';

import { Product } from './utils/firebase';
import { saveFile } from './utils/utils';

class ProductQuery {
  userId?: string;
  sort?: 'created_at' | 'nbContacted' | 'price';
  city?: string;
  country?: string;
  search?: string;
  isActive?: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  index() {
    return 'hello word';
  }

  @Get('products')
  async products(@Query() q: ProductQuery) {
    const { city, country, userId, sort, search, isActive } = q;

    let { products, countries } = this.appService.getAll();
    // Normalize search once
    const normalizedSearch =
      search && search.trim().length > 2 ? search.trim().toLowerCase() : null;

    products = products.filter((p) => {
      const user = p.user;

      if (city && user?.city !== city) return false;
      if (country && user?.country !== country) return false;
      if (userId && p.userId !== userId) return false;
      if (isActive) {
        if (!p.isActive) return false;
        if (!p.user.isSubscribedAsShop) return false;
        if (!p.user.isShopActive) return false;
      }

      if (normalizedSearch) {
        const text = `${p.title ?? ''} ${user?.shopName ?? ''}`.toLowerCase();
        if (!text.includes(normalizedSearch)) return false;
      }

      return true;
    });

    if (sort !== 'nbContacted') {
      if (sort === 'price') {
        const getPrice = (p: Product) =>
          typeof p.price === 'string'
            ? parseFloat(p.price)
            : (p.price as number);
        products.sort((a, b) => getPrice(a) - getPrice(b));
      } else {
        products.sort((a, b) => b[sort] - a[sort]);
      }
    }
    return { products, countries };
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('')
  async update(@UploadedFile() file: Express.Multer.File) {
    const { fullPath, projectRoot } = await saveFile(file);
    return fullPath.replace(projectRoot + '/', '');
  }
}
