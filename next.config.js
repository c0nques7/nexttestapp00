/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['preview.redd.it', 'external-preview.redd.it', 'b.thumbs.redditmedia.com', 'www.reddit.com', 'www.redditstatic.com', 'images.weserve.nl', 'a.thumbs.redditmedia.com', "images.pexels.com", "spankbang.com"],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.weserv.nl', // Add images.weserv.nl here
              },
              {
                protocol: 'http',
                hostname: 'images.weserv.nl', // Add images.weserv.nl here
              },
            {
                protocol: 'https',
                hostname: 'preview.redd.it',
                port: '',
                pathname: '/**', // Allow any path under preview.redd.it
            },
            {
                protocol: 'http',
                hostname: 'preview.redd.it',
                port: '',
                pathname: '/**', // Allow any path under preview.redd.it
            },
            {
                protocol: 'https',
                hostname: 'external-preview.redd.it',
                port: '',
                pathname: '/**', // Allow any path under www.reddit.com
            },
            {
                protocol: 'http',
                hostname: 'external-preview.redd.it',
                port: '',
                pathname: '/**', // Allow any path under www.reddit.com
            },
            {
                protocol: 'https',
                hostname: 'b.thumbs.redditmedia.com',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'http',
                hostname: 'b.thumbs.redditmedia.com',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'http',
                hostname: 'a.thumbs.redditmedia.com',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'http',
                hostname: 'spankbang.com',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'spankbang.com',
                port: '',
                pathname: '/**'
            }
            
            
    ],
},
};


module.exports = nextConfig;


