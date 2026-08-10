
const generateProjectData = () => {
    const statuses = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    const clients = [
        'Northwind Labs', 'Contoso Dynamics', 'Fabrikam Cloud', 'Adventure Works', 'Woodgrove Bank',
        'Litware Health', 'Blue Yonder', 'Apex Systems', 'Proseware', 'VanArsdel', 'Southridge', 'City Power'
    ];
    const leads = ['Ava Patel', 'Liam Chen', 'Mia Garcia', 'Noah Singh', 'Sophia Brown', 'Ethan Kim', 'Olivia Rivera', 'Lucas Brooks'];

    // Every department owns a themed word bank. Pairing each theme word with each
    // domain word produces 8 x 5 = 40 wholly distinct project names per department,
    // so across the 5 departments below all 200 project names are unique - none
    // share a base name with another (no "same project, different phase" naming).
    const departmentWordBanks = [
        {
            department: 'Engineering',
            themes: ['Platform', 'Cloud', 'API', 'Infrastructure', 'Security', 'DevOps', 'Backend', 'Network'],
            domains: ['Modernization', 'Migration', 'Integration', 'Automation', 'Optimization']
        },
        {
            department: 'Design',
            themes: ['Experience', 'Interface', 'Visual', 'Interaction', 'Prototype', 'Usability', 'Accessibility', 'Layout'],
            domains: ['Overhaul', 'Redesign', 'Refresh', 'Enhancement', 'Audit']
        },
        {
            department: 'Marketing',
            themes: ['Campaign', 'Brand', 'Content', 'Growth', 'Engagement', 'Outreach', 'Loyalty', 'Acquisition'],
            domains: ['Launch', 'Strategy', 'Initiative', 'Program', 'Drive']
        },
        {
            department: 'Product',
            themes: ['Feature', 'Roadmap', 'Pricing', 'Subscription', 'Analytics', 'Insights', 'Onboarding', 'Personalization'],
            domains: ['Rollout', 'Planning', 'Revamp', 'Expansion', 'Accelerator']
        },
        {
            department: 'Operations',
            themes: ['Workflow', 'Supply Chain', 'Vendor', 'Facilities', 'Logistics', 'Process', 'Resource', 'Compliance'],
            domains: ['Optimization', 'Management', 'Redesign', 'Automation', 'Modernization']
        }
    ];
    const projectsPerDepartment = 40; // 8 themes x 5 domains

    // Fisher-Yates shuffle so the generated rows aren't emitted in the same
    // contiguous per-department blocks they were built from.
    const shuffle = <T,>(array: T[]): T[] => {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    };

    const records = Array.from({ length: 200 }, (_, index) => {
        const status = statuses[index % statuses.length];
        const priority = priorities[(index * 3) % priorities.length];
        const client = clients[index % clients.length];
        const lead = leads[(index * 2) % leads.length];

        // Each department gets its own contiguous block of 40 uniquely named projects.
        const bankIndex = Math.floor(index / projectsPerDepartment) % departmentWordBanks.length;
        const withinBankIndex = index % projectsPerDepartment;
        const { department, themes, domains } = departmentWordBanks[bankIndex];
        const themeIndex = Math.floor(withinBankIndex / domains.length);
        const domainIndex = withinBankIndex % domains.length;
        const projectName = `${themes[themeIndex]} ${domains[domainIndex]}`;

        const startDate = new Date(2024, (index * 2) % 12, (index % 27) + 1);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 30 + (index % 120));
        const updateDate = new Date(startDate);
        updateDate.setDate(startDate.getDate() + (index % 45));

        const progress = status === 'Completed' ? 100 : status === 'Cancelled' ? 18 + (index % 20) : 25 + (index % 60);
        const budget = 180000 + (index * 2750) + ((index % 7) * 15000);
        const teamMembers = 3 + (index % 8);
        const allocation = status === 'Completed' ? 100 : 45 + (index % 45);

        return {
            ProjectID: `PROJ-${String(index + 1).padStart(4, '0')}`,
            ProjectName: projectName,
            Client: client,
            Department: department,
            TeamLead: lead,
            Status: status,
            Priority: priority,
            StartDate: startDate,
            EndDate: endDate,
            Budget: budget.toFixed(2),
            Progress: progress,
            TeamMembers: teamMembers,
            ResourceAllocation: `${allocation}%`,
            LastUpdate: updateDate
        };
    });

    // Randomize row order while keeping each record's ProjectID/Department/
    // ProjectName pairing intact, so the grid isn't visually sorted by department.
    return shuffle(records);
};

export const data = generateProjectData();