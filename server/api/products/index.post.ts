import prisma from '../../../shared/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody<newProduct>(event);

  const product = await prisma.product.create({
    data: {
    photoUrl: body.photoUrl,
      title: body.title,
      composition: body.composition,
      price: Number(body.price),
    },
  });

  return product;
});