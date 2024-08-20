/// <reference types="vite/client" />

import type {
  LoadingBarProviderInst,
  DialogProviderInst,
  MessageProviderInst,
  NotificationProviderInst,
  UploadFileInfo
} from 'naive-ui'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface Window {
    $loading: LoadingBarProviderInst
    $dialog: DialogProviderInst
    $message: MessageProviderInst
    $notification: NotificationProviderInst
  }
  interface Item {
    label: string
    value: string
  }
  interface Category {
    label: string
    list: Item[]
  }

  type attachMentsType = UploadFileInfo & {
    id: string
    name: T | undefined
    sourcePath?: string
  }

  type todoInfoType = {
    isShow?: boolean
    id: string | number
    content: string
    level: string | null
    type: string[] | string
    attachMents: attachMentsType[]
    memo?: string
    createdAt?: string | number | Date | undefined
    updatedAt?: string | number | Date | undefined
    isCompleted: boolean
  }
  
}
