/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ENVIRONTMENT_NAME: string;
}

interface ImportMeta{
    readonly env: ImportMetaEnv;
}