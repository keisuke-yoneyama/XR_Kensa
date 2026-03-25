export const ROUTES = {
  login: "/login",
  projects: "/projects",
  projectDetail: (id: string) => `/projects/${id}`,
  projectMembers: (id: string) => `/projects/${id}/members`,
  projectInspections: (id: string) => `/projects/${id}/inspections`,
  memberDetail: (id: string) => `/members/${id}`,
  viewer: "/viewer",
};