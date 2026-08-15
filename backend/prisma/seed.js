"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // Create demo user
    const hashedPassword = await bcryptjs_1.default.hash('Demo1234', 12);
    const user = await prisma.user.upsert({
        where: { email: 'demo@sonyduck.com' },
        update: {},
        create: {
            email: 'demo@sonyduck.com',
            password: hashedPassword,
            name: 'Demo User',
        },
    });
    console.log(`✓ Created user: ${user.email}`);
    // Create artists
    const artists = await Promise.all([
        prisma.artist.create({
            data: {
                name: 'The Beatles',
                bio: 'Legendaria banda británica de rock formada en Liverpool en 1960.',
                genres: ['Rock', 'Pop', 'Psychedelic Rock'],
                monthlyListeners: 45000000,
                imageUrl: 'https://picsum.photos/seed/beatles/400/400',
            },
        }),
        prisma.artist.create({
            data: {
                name: 'Queen',
                bio: 'Banda británica de rock formada en 1970, conocida por sus actuaciones épicas.',
                genres: ['Rock', 'Hard Rock', 'Glam Rock'],
                monthlyListeners: 38000000,
                imageUrl: 'https://picsum.photos/seed/queen/400/400',
            },
        }),
        prisma.artist.create({
            data: {
                name: 'Daft Punk',
                bio: 'Dúo francés de música electrónica que revolucionó la industria.',
                genres: ['Electronic', 'House', 'Funk'],
                monthlyListeners: 25000000,
                imageUrl: 'https://picsum.photos/seed/daftpunk/400/400',
            },
        }),
        prisma.artist.create({
            data: {
                name: 'Coldplay',
                bio: 'Banda británica de rock alternativo conocida por sus himnos emotivos.',
                genres: ['Rock Alternativo', 'Pop Rock', 'Post-Britpop'],
                monthlyListeners: 30000000,
                imageUrl: 'https://picsum.photos/seed/coldplay/400/400',
            },
        }),
        prisma.artist.create({
            data: {
                name: 'Radiohead',
                bio: 'Banda británica de rock alternativo reconocida por su innovación.',
                genres: ['Rock Alternativo', 'Art Rock', 'Electronic'],
                monthlyListeners: 18000000,
                imageUrl: 'https://picsum.photos/seed/radiohead/400/400',
            },
        }),
    ]);
    console.log(`✓ Created ${artists.length} artists`);
    // Create albums with songs
    const albumsData = [
        {
            artist: artists[0],
            title: 'Abbey Road',
            year: 1969,
            type: client_1.AlbumType.ALBUM,
            songs: [
                { title: 'Come Together', duration: 259, track: 1 },
                { title: 'Something', duration: 183, track: 9 },
                { title: 'Here Comes the Sun', duration: 185, track: 17 },
                { title: 'Let It Be', duration: 243, track: 27 },
                { title: 'Hey Jude', duration: 431, track: 25 },
            ],
        },
        {
            artist: artists[0],
            title: 'Sgt. Pepper\'s Lonely Hearts Club Band',
            year: 1967,
            type: client_1.AlbumType.ALBUM,
            songs: [
                { title: 'Lucy in the Sky with Diamonds', duration: 484, track: 3 },
                { title: 'Within You Without You', duration: 306, track: 6 },
                { title: 'A Day in the Life', duration: 337, track: 7 },
            ],
        },
        {
            artist: artists[1],
            title: 'A Night at the Opera',
            year: 1975,
            type: client_1.AlbumType.ALBUM,
            songs: [
                { title: 'Bohemian Rhapsody', duration: 354, track: 1 },
                { title: 'Love of My Life', duration: 221, track: 9 },
                { title: 'You\'re My Best Friend', duration: 176, track: 13 },
            ],
        },
        {
            artist: artists[1],
            title: 'News of the World',
            year: 1977,
            type: client_1.AlbumType.ALBUM,
            songs: [
                { title: 'We Will Rock You', duration: 122, track: 1 },
                { title: 'We Are the Champions', duration: 179, track: 2 },
                { title: 'Who Needs You', duration: 188, track: 9 },
            ],
        },
        {
            artist: artists[2],
            title: 'Random Access Memories',
            year: 2013,
            type: client_1.AlbumType.ALBUM,
            songs: [
                { title: 'Get Lucky', duration: 369, track: 1 },
                { title: 'Instant Crush', duration: 337, track: 4 },
                { title: 'Lose Yourself to Dance', duration: 354, track: 3 },
                { title: 'Giorgio by Moroder', duration: 544, track: 6 },
            ],
        },
        {
            artist: artists[3],
            title: 'Parachutes',
            year: 2000,
            type: client_1.AlbumType.ALBUM,
            songs: [
                { title: 'Yellow', duration: 269, track: 2 },
                { title: 'Clocks', duration: 307, track: 6 },
                { title: 'Sparks', duration: 226, track: 8 },
            ],
        },
        {
            artist: artists[3],
            title: 'A Rush of Blood to the Head',
            year: 2002,
            type: client_1.AlbumType.ALBUM,
            songs: [
                { title: 'Clocks', duration: 307, track: 3 },
                { title: 'The Scientist', duration: 309, track: 2 },
                { title: 'Fix You', duration: 295, track: 5 },
                { title: 'Viva la Vida', duration: 242, track: 11 },
            ],
        },
        {
            artist: artists[4],
            title: 'OK Computer',
            year: 1997,
            type: client_1.AlbumType.ALBUM,
            songs: [
                { title: 'Paranoid Android', duration: 387, track: 1 },
                { title: 'Karma Police', duration: 264, track: 4 },
                { title: 'No Surprises', duration: 228, track: 6 },
            ],
        },
    ];
    let totalSongs = 0;
    for (const albumData of albumsData) {
        const album = await prisma.album.create({
            data: {
                title: albumData.title,
                releaseYear: albumData.year,
                type: albumData.type,
                artistId: albumData.artist.id,
                coverUrl: `https://picsum.photos/seed/${albumData.title.replace(/[^a-z0-9]/gi, '')}/400/400`,
            },
        });
        for (const songData of albumData.songs) {
            // AI metadata based on artist and song characteristics
            const artistGenres = albumData.artist.genres || [];
            const isRock = artistGenres.some(g => g.includes('Rock'));
            const isElectronic = artistGenres.some(g => g.includes('Electronic'));
            const isPop = artistGenres.some(g => g.includes('Pop'));
            // Determine decade based on album year
            const decade = albumData.year < 1975 ? '70s'
                : albumData.year < 1985 ? '80s'
                    : albumData.year < 1995 ? '90s'
                        : albumData.year < 2005 ? '00s'
                            : albumData.year < 2015 ? '10s'
                                : '20s';
            // AI features based on song characteristics
            const moods = ['epic', 'nostalgic'];
            const tags = [...artistGenres.map(g => g.toLowerCase())];
            // Energy and valence based on song and artist
            const energy = albumData.artist.name === 'Daft Punk' ? 0.8
                : albumData.artist.name === 'Queen' ? 0.75
                    : albumData.artist.name === 'Radiohead' ? 0.6
                        : 0.65;
            const danceability = isElectronic ? 0.8
                : isRock ? 0.5
                    : 0.6;
            const valence = albumData.title.includes('Hey Jude') || albumData.title.includes('Lucky') ? 0.8
                : albumData.title.includes('Bohemian') || albumData.title.includes('Paranoid') ? 0.4
                    : 0.6;
            const tempo = isElectronic ? 120
                : isRock ? 110
                    : 100;
            const occasions = ['chill', 'party'];
            await prisma.song.create({
                data: {
                    title: songData.title,
                    duration: songData.duration,
                    trackNumber: songData.track,
                    audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(totalSongs % 16) + 1}.mp3`,
                    albumId: album.id,
                    artistId: albumData.artist.id,
                    // AI Fields
                    tempo: tempo + Math.random() * 10 - 5,
                    energy: energy,
                    danceability: danceability,
                    valence: valence,
                    moods: moods,
                    tags: tags,
                    decade: decade,
                    occasions: occasions,
                    playCount: Math.floor(Math.random() * 10000),
                },
            });
            totalSongs++;
        }
        console.log(`✓ Created album: ${album.title} with ${albumData.songs.length} songs`);
    }
    // Create sample playlists for demo user
    const allSongs = await prisma.song.findMany({ take: 10 });
    const favoriteSongs = allSongs.slice(0, 5);
    // Create liked songs playlist
    const likedSongsPlaylist = await prisma.playlist.findFirst({
        where: { ownerId: user.id, isLikedSongs: true },
    });
    if (likedSongsPlaylist) {
        // Add some songs to liked playlist
        for (let i = 0; i < favoriteSongs.length; i++) {
            await prisma.playlistSong.create({
                data: {
                    playlistId: likedSongsPlaylist.id,
                    songId: favoriteSongs[i].id,
                    position: i,
                },
            });
            await prisma.likedSong.create({
                data: {
                    userId: user.id,
                    songId: favoriteSongs[i].id,
                },
            });
        }
        console.log(`✓ Added ${favoriteSongs.length} songs to Liked Songs`);
    }
    // Create custom playlists
    const chillPlaylist = await prisma.playlist.create({
        data: {
            name: 'Chill Vibes',
            description: 'Canciones relajantes para estudiar o descansar',
            ownerId: user.id,
            isPublic: true,
        },
    });
    for (let i = 0; i < Math.min(5, allSongs.length); i++) {
        await prisma.playlistSong.create({
            data: {
                playlistId: chillPlaylist.id,
                songId: allSongs[i].id,
                position: i,
            },
        });
    }
    console.log(`✓ Created playlist: ${chillPlaylist.name}`);
    const rockPlaylist = await prisma.playlist.create({
        data: {
            name: 'Rock Classics',
            description: 'Los mejores clásicos del rock',
            ownerId: user.id,
            isPublic: true,
        },
    });
    const rockSongs = allSongs.filter(s => s.artistId === artists[0].id || s.artistId === artists[1].id);
    for (let i = 0; i < rockSongs.length; i++) {
        await prisma.playlistSong.create({
            data: {
                playlistId: rockPlaylist.id,
                songId: rockSongs[i].id,
                position: i,
            },
        });
    }
    console.log(`✓ Created playlist: ${rockPlaylist.name}`);
    console.log('\n🎉 Database seeded successfully!');
    console.log(`\n📧 Demo credentials:`);
    console.log(`   Email: demo@sonyduck.com`);
    console.log(`   Password: Demo1234`);
}
main()
    .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map