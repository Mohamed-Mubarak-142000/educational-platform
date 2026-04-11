/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    // model-viewer web component
    'model-viewer': Record<string, unknown>;
  }
}

declare module '*.glb' {
  const src: string;
  export default src;
}
