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

  interface stringType {
    url: string
  }

  type attachMentsType = UploadFileInfo & {
    id: string
    name: T | undefined
    sourcePath?: string
  }

  type paramsTodoType = {
    isShow?: boolean
    ID?: string | number
    id?: string | number
    Content?: string
    content: string
    level: string | null
    type: string[] | string
    attachMents: string[] | undefined
    memo?: string
    CreatedAt?: string | number | Date | undefined
    createdAt?: string | number | Date | undefined
    UpdatedAt?: string | number | Date | undefined
    updatedAt?: string | number | Date | undefined
    isCompleted: boolean,
    isRomote: boolean,
    isEdited?: boolean,
  }

  type todoInfoType = {
    isShow?: boolean
    id?: string | number
    content: string
    level: string | null
    type: string[] | string
    attachMents: attachMentsType[]
    memo?: string
    CreatedAt?: string | number | Date | undefined
    createdAt?: string | number | Date | undefined
    UpdatedAt?: string | number | Date | undefined
    updatedAt?: string | number | Date | undefined
    isCompleted: boolean,
    isRomote: boolean,
    isEdited?: boolean
  }

  interface resType {code: number, data: any|{list: any}, msg: string}

  // 定义响应类型接口
  interface resBlobType {
    data: Blob;
    status?: number;
    statusText?: string;
    headers?: any;
    config?: any;
  }
  
}
