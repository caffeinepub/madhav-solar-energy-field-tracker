// Type shim for leaflet (loaded via CDN / dynamic import at runtime)
declare module "leaflet" {
  const L: any;
  export default L;
  export = L;
}

declare module "leaflet/dist/leaflet.css" {
  const content: string;
  export default content;
}
