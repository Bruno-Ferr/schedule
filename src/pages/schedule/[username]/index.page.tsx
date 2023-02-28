import { Avatar, Heading, Text } from '@ignite-ui/react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'
import { prisma } from '../../../lib/prisma'
import { ScheduleForm } from './ScheduleForm'
import { Container, UserHeader } from './styles'

interface ScheduleProps {
  user: {
    name: string
    bio: string
    avatarUrl: string
  }
}

export default function Schedule({ user }: ScheduleProps) {
  return (
    <>
      <NextSeo title={`Agendar com ${user.name} | Ignite Call`} />
      <Container>
        <UserHeader>
          <Avatar src={user.avatarUrl} />
          <Heading>{user.name}</Heading>
          <Text>{user.bio}</Text>
        </UserHeader>

        <ScheduleForm />
      </Container>
    </>
  )
}


//Quanto temos uma página estática mas recebe um parâmetro que é dinâmico, precisamos gerar uma pág. estática por user
//Sendo obrigado a informar no next o método getStaticPaths 
//   no momento da build gera todas as pág. estáticas, mas com um parâmetro dinâmico ele não sabe qual é esse parâmetro
//   essa função diz quais os parâmetros para gerar as páginas na build.
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], // Para não gerar nenhuma página no primeiro momento da build
    fallback: 'blocking', // Espera gerar tudo e depois mostrar ao user 
  }
}

//Comportamento de página estática
// getStaticProps sempre é executado no lado do servidor, podendo trabalhar dentro dele como se estivesse no backend
export const getStaticProps: GetStaticProps = async ({ params }) => { 
  // Primeira versão da página é criada no momento da build, onde não existe requisição (por isso deve-se utilizar o params)
  const username = String(params?.username)

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return {
      notFound: true, //Página 404 (também customizavel no next)
    }
  }

  return {
    props: {
      user: {
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatar_url,
      },
    },
    revalidate: 60 * 60 * 24, // 1 day, indica de quanto em quanto tempo essa pág deve ser re-criada
  }
}