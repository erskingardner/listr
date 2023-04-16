<script lang="ts">
    import PersonCard from '$lib/components/PersonCard.svelte';

    const npubs: string[] = [
        'npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6', // Fiatjaf
        'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft', // Pablo
        'npub1zuuajd7u3sx8xu92yav9jwxpr839cs0kc3q6t56vd5u9q033xmhsk6c2uc', // Me
        'npub1hu3hdctm5nkzd8gslnyedfr5ddz3z547jqcl5j88g4fame2jd08qh6h8nh', // Carla
        'npub1sg6plzptd64u62a878hep2kev88swjh3tw00gjsfl8f237lmu63q0uf63m', // Jack
        'npub16c0nh3dnadzqpm76uctf5hqhe2lny344zsmpm6feee9p5rdxaa9q586nvr', // Miljan
        'npub1h50pnxqw9jg7dhr906fvy4mze2yzawf895jhnc3p7qmljdugm6gsrurqev', // Vanessa
        'npub1csamkk8zu67zl9z4wkp90a462v53q775aqn5q6xzjdkxnkvcpd7srtz4x9', // Roya
        'npub1fy4lqfduww22jh5rm4jfj4nfhncdjz2ndccw7mxh8jrv2035lugqdkag4y', // Alice
        // 'npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc', // Gigi
        'npub19vvkfwy9mcluhvehw7r56p4stsj5lmx4v9g3vgkwsm3arpgef8aqsrt562', // Angela
        'npub1utx00neqgqln72j22kej3ux7803c2k986henvvha4thuwfkper4s7r50e8', // UTXO
        'npub1xtscya34g58tk0z605fvr788k263gsu6cy9x0mhnm87echrgufzsevkk5s', // JB55
        'npub158mxap4gsexqeutj5sws2pfkngyq3lh726gex8wa7flt28tzhytq4jy85z', // Amanda
        'npub1rpes5hhk6mxun5ddt5kecxfm8y3xdr0h5jwal32mc6mxafr48hxsaj2et2', // Mads
        'npub1jt0x3vsnqtazzda3ewa8ykdch2t8k566qhrd9vyy0k0ntleu744q8h6q3n' // SusieBdds
        // 'npub1a7n2h5y3gt90y00mwrknhx74fyzzjqw25ehkscje58x9tfyhqd5snyvfnu' // Elidy
        // 'npub1y67n93njx27lzmg9ua37ce7csvq4awvl6ynfqffzfssvdn7mq9vqlhq62h' // Marce
    ];

    const shuffled = npubs.sort(() => 0.5 - Math.random());
</script>

<div class="prose-stone prose-lg dark:prose-invert mx-auto mb-10">
    <p class="">
        Listr is a simple tool that allows you to browse your own lists and the lists of other
        users. Soon you'll also be able to manage your lists; adding and removing items and deciding
        what is publicly listed and what is private.
    </p>
    <h2 class="text-xl md:text-3xl mb-4 font-bold tracking-tight">Check out a few examples</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each shuffled.slice(0, 9) as personNpub}
            <PersonCard npub={personNpub} />
        {/each}
    </div>
    <h2 class="text-xl md:text mb-4 font-bold tracking-tight">What are lists?</h2>
    <p>
        Lists in Nostr are defined in <a
            href="https://github.com/nostr-protocol/nips/blob/master/51.md"
            target="_blank">NIP-51</a
        >. There are several different types of lists. All types of lists are replaceable, meaning
        that only the most recent event (version of your list) matters.
    </p>
    <ul class="list-disc list-inside">
        <li>
            <strong>Mute list:</strong> <code>(kind: 10000)</code> This is for muted users and conversations.
        </li>
        <li>
            <strong>Pin list:</strong> <code>(kind: 10001)</code> This is for pinned conversations.
        </li>
        <li>
            <strong>Categorized People list:</strong> <code>(kind: 30000)</code> This is a list of users
            with a title. Hence, you can store any type of people list you'd like.
        </li>
        <li>
            <strong>Categorized Bookmark list:</strong> <code>(kind: 30001)</code> This is a list of
            notes with a title. Hence, you can store any arbitrary list of notes you'd like.
        </li>
    </ul>
    <p>
        All lists have a mechanism to store values in a public or private way. More on this in the
        future...
    </p>
</div>
