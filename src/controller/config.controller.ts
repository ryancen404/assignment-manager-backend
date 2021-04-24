let noTokenCheckRouterPaths: string[] = [];

const addPathToNoTokenChecks = (path: string) => {
  noTokenCheckRouterPaths = noTokenCheckRouterPaths.concat(path);
}

const removeNoTokenChecks = (path: string) => {
  noTokenCheckRouterPaths = noTokenCheckRouterPaths.filter(p => p !== path);
}

const getNoTokenCheckPaths = () => noTokenCheckRouterPaths

const ControllerConfig = {
  addPathToNoTokenChecks,
  removeNoTokenChecks,
  getNoTokenCheckPaths
}

export default ControllerConfig;