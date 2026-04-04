import prisma from '../../../shared/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id || '0')
  
  await prisma.product.delete({
    where: { id }
  })
  
  return { success: true }
})