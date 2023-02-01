import { Button, Text, TextInput } from '@ignite-ui/react'
import { ArrowRight } from 'phosphor-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormAnnotation } from './styles'
import { useRouter } from 'next/router'

const claimUsernameFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Nome de usuário precisa ter ao menos 3 letras' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'Nome de usuário só pode conter letras e hifens',
    })
    .transform((username) => username.toLowerCase()),
}) // Regras de validação e tbm transformações feitas com o zod

type ClaimUsernameFormData = z.infer<typeof claimUsernameFormSchema> // Converte a estrutura do zod em estrutura ts

export function ClaimUsernameForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClaimUsernameFormData>({
    resolver: zodResolver(claimUsernameFormSchema), // Para fazer validações de formulários
  })

  const router = useRouter() // Hook para redirecionar o usuário

  async function handleClaimUsername(data: ClaimUsernameFormData) {
    const { username } = data

    await router.push(`/register?username=${username}`) // Redireciona o usuário, passando um query param
    // Como é uma promisse, utilizar o assincrono para mostrar que a página está carregando algo
  }

  return (
    <>
      <Form as="form" onSubmit={handleSubmit(handleClaimUsername)}>
        <TextInput
          size="sm"
          prefix="ignite.com/"
          placeholder="seu usuário"
          {...register('username')}
        ></TextInput>
        <Button size="sm" type="submit" disabled={isSubmitting}>
          Reservar
          <ArrowRight />
        </Button>
      </Form>
      <FormAnnotation>
        <Text size="sm">
          {errors.username
            ? errors.username.message
            : 'Digite o nome de usuário desejado'}
        </Text>
      </FormAnnotation>
    </>
  )
}
