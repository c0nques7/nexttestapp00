/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
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
            }
            
    ],
},
};


module.exports = nextConfig;


