import 'next'

declare module 'next' {
  export interface RouteHandlerContext<P = Record<string, string | string[]>> {
    params: Promise<P>
  }
}

