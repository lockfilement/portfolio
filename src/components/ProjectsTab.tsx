import { ExternalLink } from 'lucide-react';

interface Project {
  name: string;
  description: string;
  tech: string[];
  link?: string;
  image: string;
}

const projects: Project[] = [
  {
    name: 'Lyzor LLC',
    description: 'operates digital products ranging from Discord Bots to full fledged apps',
    tech: ['Next.js', 'ReactJS', 'JavaScript', 'Python'],
    link: 'https://lyzor.netlify.app/',
    image: 'https://avatars.githubusercontent.com/u/226920714?s=200'
  },
];

const ProjectsTab = () => {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground mb-3">
        a collection of things i've worked on
      </p>

      {projects.map((project, index) => (
        <div key={index} className="content-section">
          <div className="flex items-start gap-3">

            {/* Logo */}
            <img
              src={project.image}
              alt={project.name}
              className="w-12 h-12 rounded-md object-cover shrink-0"
            />

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-medium text-foreground/90">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {project.description}
                  </p>

                  <div className="flex gap-1.5 mt-2">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectsTab;
