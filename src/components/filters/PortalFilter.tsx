import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FilterState } from 'types/filter';

const PortalContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 5px 0;
`;

interface PortalButtonProps {
  active?: boolean;
}

const PortalButton = styled(motion.button)<PortalButtonProps>`
  padding: 0;
  background: ${({ active }) => (active ? '#fff' : '#E6F0FA')};
  border: 1px solid ${({ active }) => (active ? 'var(--zhipin-teal)' : 'var(--zhipin-border)')};
  border-radius: 50%;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
  &:hover {
    border-color: var(--zhipin-teal);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }
`;

const PortalLogo = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: contain;
`;

interface PortalFilterProps {
  filters: FilterState;
  onFilter: (newFilters: Partial<FilterState>) => void;
}

const portals = [
  { name: 'Get On Board', logo: '/icon-new-c18debbaa69bac8df6158426f4a00752b32a7fba603cba4eeb3e4572466344a6.png' },
  { name: 'BNE.cl', logo: '/Logo-BNE-slogan-1.png' },
];

const PortalFilter: React.FC<PortalFilterProps> = ({ filters, onFilter }) => {
  const togglePortal = (portal: string) => {
    const newPortals = new Set(filters.selectedPortals);
    if (newPortals.has(portal)) newPortals.delete(portal);
    else newPortals.add(portal);
    console.log(`Toggled Portal: ${portal}, Selected Portals:`, Array.from(newPortals));
    onFilter({ selectedPortals: newPortals });
  };

  return (
    <div>
      <PortalContainer>
        {portals.map((portal) => (
          <PortalButton
            key={portal.name}
            title={portal.name}
            active={filters.selectedPortals.has(portal.name)}
            onClick={() => togglePortal(portal.name)}
            animate={{ scale: filters.selectedPortals.has(portal.name) ? 1.1 : 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <PortalLogo src={portal.logo} alt={`${portal.name} logo`} onError={(e) => (e.currentTarget.style.display = 'none')} />
          </PortalButton>
        ))}
      </PortalContainer>
    </div>
  );
};

export default PortalFilter;