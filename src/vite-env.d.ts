/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    // model-viewer web component
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'model-viewer': any;
  }
}

declare module '*.glb' {
  const src: string;
  export default src;
}
