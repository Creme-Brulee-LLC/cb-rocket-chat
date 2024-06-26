import type { FC } from 'react';
import React, { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { createAnchor } from '../lib/utils/createAnchor';
import { deleteAnchor } from '../lib/utils/deleteAnchor';

const TooltipPortal: FC = ({ children }) => {
	const [tooltipRoot] = useState(() => createAnchor('tooltip-root'));
	useEffect(() => (): void => deleteAnchor(tooltipRoot), [tooltipRoot]);
	return <>{createPortal(children, tooltipRoot)}</>;
};

export default memo<typeof TooltipPortal>(TooltipPortal);
