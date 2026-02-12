const {prisma}= require('./lib/prisma');

async function main(){
    
    const allUsers = await prisma.user.findMany({
        include:{
            files: true,
            folder: true
        }
    });
    console.log('All users', allUsers);
    
}

main()
    .then(async()=>{
        await prisma.$disconnect()
    })
    .catch(async(e)=>{
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

