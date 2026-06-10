export const toPlain = (instance) => {
  if (!instance) return null;
  if (Array.isArray(instance)) return instance.map((i) => toPlain(i));
  return instance.get ? instance.get({ plain: true }) : instance;
};
