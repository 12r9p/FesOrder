import React from 'react';
import { Circle} from '@/types/interfaces';

const CircleList: React.FC<Circle> = ({
    id,
    name,
    description,
    iconImagePath,
    backgroundImagePath,
}) => {
    console.dir({ id, name, description, iconImagePath, backgroundImagePath });
    return (
        <li key={id} className="border border-gray-300 rounded-lg p-4 my-2 bg-gray-100">
            <h2 className="text-xl font-bold">{name}</h2>
            <p className="text-gray-700">{description}</p>
            {iconImagePath && <img src={iconImagePath} alt={`${name} icon`} />}
            {backgroundImagePath && <img src={backgroundImagePath} alt={`${name} background`} />}
        </li>
    );
};

export default CircleList;