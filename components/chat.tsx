'use client'

import { useChat, type Message } from 'ai/react'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { usePathname, useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

const models = {
  'gpt-3.5-turbo-16k': {
    name: 'GPT-3.5 Turbo 16k',
    key: 'gpt-3.5-turbo-16k'
  },
  'gpt-4': {
    name: 'GPT-4',
    key: 'gpt-4'
  }
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    'ai-token',
    null
  )
  const router = useRouter()
  const search = useSearchParams()
  const pathname = usePathname()
  const modelOverride = search.get('model')
  let model = models['gpt-3.5-turbo-16k'].key
  if (modelOverride) {
    model = modelOverride
  }
  const activateModel = (model: string) => () => {
    const params = new URLSearchParams(search.toString())
    params.set('model', model)
    const urlWithParams = `${pathname}?${params.toString()}`
    router.replace(urlWithParams)
  }
  const modelButtonVariant = (key: string, curModel: string) => {
    const isActive = key === curModel
    return isActive ? 'default' : 'secondary'
  }

  //prepare ui component
  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      initialMessages,
      id,
      body: {
        id,
        previewToken,
        model
      }
    })
  return (
    <>
      <div className={cn(`flex justify-center pt-3`)}>
        <Button
          variant={modelButtonVariant(models['gpt-3.5-turbo-16k'].key, model)}
          onClick={activateModel(models['gpt-3.5-turbo-16k'].key)}
        >
          GPT-3.5 Turbo
        </Button>

        <Button
          variant={modelButtonVariant(models['gpt-4'].key, model)}
          onClick={activateModel(models['gpt-4'].key)}
        >
          GPT-4
        </Button>
      </div>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />

      <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your OpenAI Key</DialogTitle>
            <DialogDescription>
              If you have not obtained your OpenAI API key, you can do so by{' '}
              <a
                href="https://platform.openai.com/signup/"
                className="underline"
              >
                signing up
              </a>{' '}
              on the OpenAI website. This is only necessary for preview
              environments so that the open source community can test the app.
              The token will be saved to your browser&apos;s local storage under
              the name <code className="font-mono">ai-token</code>.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={previewTokenInput}
            placeholder="OpenAI API key"
            onChange={e => setPreviewTokenInput(e.target.value)}
          />
          <DialogFooter className="items-center">
            <Button
              onClick={() => {
                setPreviewToken(previewTokenInput)
                setPreviewTokenDialog(false)
              }}
            >
              Save Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
