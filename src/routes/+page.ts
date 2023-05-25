import type { PageLoad } from './$types';

export const load = (async () => {
    const npubs: string[] = [
        'npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6', // Fiatjaf
        // 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft', // Pablo
        'npub1zuuajd7u3sx8xu92yav9jwxpr839cs0kc3q6t56vd5u9q033xmhsk6c2uc', // Me
        'npub16c0nh3dnadzqpm76uctf5hqhe2lny344zsmpm6feee9p5rdxaa9q586nvr', // Miljan
        'npub1h50pnxqw9jg7dhr906fvy4mze2yzawf895jhnc3p7qmljdugm6gsrurqev', // Vanessa
        'npub1csamkk8zu67zl9z4wkp90a462v53q775aqn5q6xzjdkxnkvcpd7srtz4x9', // Roya
        // 'npub19vvkfwy9mcluhvehw7r56p4stsj5lmx4v9g3vgkwsm3arpgef8aqsrt562', // Angela
        'npub1utx00neqgqln72j22kej3ux7803c2k986henvvha4thuwfkper4s7r50e8', // UTXO
        'npub1xtscya34g58tk0z605fvr788k263gsu6cy9x0mhnm87echrgufzsevkk5s', // JB55
        // 'npub158mxap4gsexqeutj5sws2pfkngyq3lh726gex8wa7flt28tzhytq4jy85z', // Amanda
        // 'npub1rpes5hhk6mxun5ddt5kecxfm8y3xdr0h5jwal32mc6mxafr48hxsaj2et2', // Mads
        'npub1jt0x3vsnqtazzda3ewa8ykdch2t8k566qhrd9vyy0k0ntleu744q8h6q3n', // SusieBdds
        'npub1hu3hdctm5nkzd8gslnyedfr5ddz3z547jqcl5j88g4fame2jd08qh6h8nh', // Carla
        'npub1sg6plzptd64u62a878hep2kev88swjh3tw00gjsfl8f237lmu63q0uf63m', // Jack
        'npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc', // Gigi
        'npub107jk7htfv243u0x5ynn43scq9wrxtaasmrwwa8lfu2ydwag6cx2quqncxg', // verbiricha
        'npub1ejxswthae3nkljavznmv66p9ahp4wmj4adux525htmsrff4qym9sz2t3tv' // Sherry
        // 'npub1a7n2h5y3gt90y00mwrknhx74fyzzjqw25ehkscje58x9tfyhqd5snyvfnu' // Elidy
        // 'npub1y67n93njx27lzmg9ua37ce7csvq4awvl6ynfqffzfssvdn7mq9vqlhq62h' // Marce
    ];

    const shuffled = npubs.sort(() => 0.5 - Math.random()).slice(0, 9);

    return {
        npubs: shuffled
    };
}) satisfies PageLoad;
