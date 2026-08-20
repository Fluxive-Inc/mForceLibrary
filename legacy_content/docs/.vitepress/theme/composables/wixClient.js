import { ref } from 'vue'

const MOCK_NEWS = [
    {
        _id: '1',
        title: 'Fluxive Launches New Edge Nodes',
        excerpt: 'Experience lower latency and higher security with our new edge infrastructure.',
        content: `
            <p>We are proud to announce the immediate availability of our new Edge Node network.</p>
            <h3>Key Features</h3>
            <ul>
                <li><strong>Speed:</strong> < 50ms latency globally.</li>
                <li><strong>Security:</strong> End-to-end encryption by default.</li>
            </ul>
            <p>Get started today by updating your configuration.</p>
        `,
        image: 'https://images.unsplash.com/photo-1558494949-ef526b0042a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        author: 'Sarah Chen',
        date: '2025-10-15',
        tags: ['Infrastructure', 'Release']
    },
    {
        _id: '2',
        title: 'Community Spotlight: Agent Swarms',
        excerpt: 'How one developer built a self-healing devops swarm using Fluxive.',
        content: `
            <p>Meet James, a DevOps engineer who automated his entire on-call rotation.</p>
            <p>Using Fluxive's agent protocol, he created a swarm that detects, diagnoses, and fixes production issues in real-time.</p>
            <blockquote>"I actually sleep through the night now," says James.</blockquote>
        `,
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        author: 'Mike Ross',
        date: '2025-10-12',
        tags: ['Community', 'Case Study']
    },
    {
        _id: '3',
        title: 'API Version 2.0 Roadmap',
        excerpt: 'A look ahead at the breaking changes and new features coming in v2.0.',
        content: `
            <p>As we prepare for the next major version of the Fluxive API, we want to share our roadmap.</p>
            <p>Expect simpler authentication, faster streaming responses, and better type safety.</p>
        `,
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        author: 'Dev Team',
        date: '2025-10-01',
        tags: ['Engineering', 'Roadmap']
    }
]

export function useWixClient() {

    const fetchNewsItem = async (id) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))
        return MOCK_NEWS.find(item => item._id === id) || null
    }

    const fetchNewsList = async () => {
        await new Promise(resolve => setTimeout(resolve, 500))
        return MOCK_NEWS
    }

    return {
        fetchNewsItem,
        fetchNewsList
    }
}
