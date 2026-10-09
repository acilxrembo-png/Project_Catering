// @ts-nocheck
export const validate = (schemas) => (req, _res, next) => {
  if (schemas.params) req.params = schemas.params.parse(req.params);
  if (schemas.query) {
    const parsed = schemas.query.parse(req.query);
    Object.defineProperty(req, "query", { value: parsed, writable: true, configurable: true });
  }
  if (schemas.body) req.body = schemas.body.parse(req.body);
  next();
};
