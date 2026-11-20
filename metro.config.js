const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  server: {
    enhanceMiddleware: middleware => async (request, response, next) => {
      const url = new URL(request.url, 'http://localhost');
      if (url.pathname !== '/cashroute-dev/road-route') {
        return middleware(request, response, next);
      }

      const localAddresses = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
      if (!localAddresses.includes(request.socket.remoteAddress) || request.method !== 'GET') {
        response.writeHead(403).end();
        return;
      }

      const coordinates = url.searchParams.get('coordinates') ?? '';
      if (!/^-?\d{1,3}(\.\d{1,10})?,-?\d{1,2}(\.\d{1,10})?;-?\d{1,3}(\.\d{1,10})?,-?\d{1,2}(\.\d{1,10})?$/.test(coordinates)) {
        response.writeHead(400).end();
        return;
      }

      try {
        const routeUrl = 'https://routing.openstreetmap.de/routed-car/route/v1/driving/' +
          coordinates + '?overview=full&geometries=geojson';
        const upstream = await fetch(routeUrl, { signal: AbortSignal.timeout(6500) });
        response.writeHead(upstream.status, { 'Content-Type': 'application/json' });
        response.end(await upstream.text());
      } catch {
        if (!response.headersSent) response.writeHead(502);
        response.end();
      }
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
