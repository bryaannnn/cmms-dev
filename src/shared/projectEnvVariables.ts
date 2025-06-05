type ProjectEnvVariablesType = Pick<ImportMetaEnv,
|   "VITE_REACT_API_URL" >;
// |   "VITE_GENERATE_SOURCEMAP"
// |   "VITE_ENVIRONTMENT_NAME"
// |   "VITE_APPLICATION_NAME" 
// |   "VITE_APPLICATION_VERSION" 

const projectEnvVariables : ProjectEnvVariablesType = {
    VITE_REACT_API_URL: "${VITE_REACT_API_URL}",
    // VITE_GENERATE_SOURCEMAP: "${VITE_GENERATE_SOURCEMAP}",
    // VITE_ENVIRONTMENT_NAME: "${VITE_ENVIRONTMENT_NAME}",
    // VITE_APPLICATION_NAME: "${VITE_APPLICATION_NAME}",
    // VITE_APPLICATION_VERSION: "${VITE_APPLICATION_VERSION}",
}

export const getProjectEnvVariables = (): {
    envVariables: ProjectEnvVariablesType
} => {
    return {
        envVariables: {
            VITE_REACT_API_URL: !projectEnvVariables.VITE_REACT_API_URL.includes("VITE")
            ? projectEnvVariables.VITE_REACT_API_URL
            : import.meta.env.VITE_REACT_API_URL,

            // VITE_GENERATE_SOURCEMAP: !projectEnvVariables.VITE_GENERATE_SOURCEMAP.includes("VITE")
            // ? projectEnvVariables.VITE_GENERATE_SOURCEMAP
            // : import.meta.env.VITE_GENERATE_SOURCEMAP,


            // VITE_ENVIRONTMENT_NAME: !projectEnvVariables.VITE_ENVIRONTMENT_NAME.includes("VITE")
            // ? projectEnvVariables.VITE_ENVIRONTMENT_NAME
            // : import.meta.env.VITE_ENVIRONTMENT_NAME,

            // VITE_APPLICATION_NAME: !projectEnvVariables.VITE_APPLICATION_NAME.includes("VITE")
            // ? projectEnvVariables.VITE_APPLICATION_NAME
            // : import.meta.env.VITE_APPLICATION_NAME,

            // VITE_APPLICATION_VERSION: !projectEnvVariables.VITE_APPLICATION_VERSION.includes("VITE")
            // ? projectEnvVariables.VITE_APPLICATION_VERSION
            // : import.meta.env.VITE_APPLICATION_VERSION,
        }
    }
}