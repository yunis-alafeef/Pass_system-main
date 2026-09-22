const fs = require('fs');
const path = require('path');

const modules = [
  'seats',
  'bookings',
  'payments',
  'vendors',
  'users'
];

const srcDir = path.join(__dirname, 'src', 'modules');

modules.forEach(mod => {
  const modDir = path.join(srcDir, mod);
  if (!fs.existsSync(modDir)) {
    fs.mkdirSync(modDir, { recursive: true });
  }

  const moduleContent = `import { Module } from '@nestjs/common';
import { ${capitalize(mod)}Controller } from './${mod}.controller';
import { ${capitalize(mod)}Service } from './${mod}.service';

@Module({
  controllers: [${capitalize(mod)}Controller],
  providers: [${capitalize(mod)}Service],
})
export class ${capitalize(mod)}Module {}
`;

  const controllerContent = `import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ${capitalize(mod)}Service } from './${mod}.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('${mod}')
export class ${capitalize(mod)}Controller {
  constructor(private readonly ${mod}Service: ${capitalize(mod)}Service) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.${mod}Service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.${mod}Service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDto: any) {
    return this.${mod}Service.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.${mod}Service.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.${mod}Service.remove(id);
  }
}
`;

  const serviceContent = `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ${capitalize(mod)}Service {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.${getPrismaModel(mod)}.findMany();
  }

  findOne(id: string) {
    return this.prisma.${getPrismaModel(mod)}.findUnique({ where: { id } });
  }

  create(data: any) {
    return this.prisma.${getPrismaModel(mod)}.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.${getPrismaModel(mod)}.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.${getPrismaModel(mod)}.delete({ where: { id } });
  }
}
`;

  fs.writeFileSync(path.join(modDir, \`\${mod}.module.ts\`), moduleContent);
  fs.writeFileSync(path.join(modDir, \`\${mod}.controller.ts\`), controllerContent);
  fs.writeFileSync(path.join(modDir, \`\${mod}.service.ts\`), serviceContent);
});

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getPrismaModel(s) {
  if (s === 'seats') return 'seat';
  if (s === 'bookings') return 'booking';
  if (s === 'payments') return 'payment';
  if (s === 'vendors') return 'vendor';
  if (s === 'users') return 'user';
  return s;
}

console.log('Scaffolding complete!');
