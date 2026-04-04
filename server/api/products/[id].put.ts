import prisma from '../../../shared/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '0')
  const body = await readBody(event)
  
  const product = await prisma.product.update({
    where: { id },
    data: {
      photoUrl: body.photoUrl,
      title: body.title,
      composition: body.composition,
      price: Number(body.price)
    }
  })
  
  return product
})