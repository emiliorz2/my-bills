import 'next'

declare module 'next' {
  export interface RouteHandlerContext<P = any> {
    params: any
  }
}
