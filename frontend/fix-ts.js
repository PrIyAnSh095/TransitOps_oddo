const fs = require('fs');
const fix = (file, search, replace) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
};

fix('src/components/ui/KPICard.tsx', /import React(?:, \{[^}]*\})? from 'react';\n?/g, '');
fix('src/components/ui/NotificationDropdown.tsx', /import React(?:, \{[^}]*\})? from 'react';\n?/g, '');
fix('src/components/ui/SummaryCard.tsx', /import React(?:, \{[^}]*\})? from 'react';\n?/g, '');
fix('src/layouts/AppShell.tsx', /Menu, X, ChevronDown, Bell, LogOut/g, 'Menu, X, ChevronDown, LogOut');
fix('src/pages/auth/ForgotPassword.tsx', /import \{ Link, useNavigate \} from 'react-router-dom';/g, "import { Link } from 'react-router-dom';");
fix('src/pages/auth/ResetPassword.tsx', /const navigate = useNavigate\(\);/g, '');
fix('src/pages/dashboard/ManagerDashboard.tsx', /Activity, /g, '');
fix('src/pages/dashboard/ManagerDashboard.tsx', /formatter=\{\(val: number\) =>/g, 'formatter={(val: any) =>');
fix('src/pages/maintenance/Maintenance.tsx', /import \{ useState, useEffect \} from 'react';\nimport \{ Plus, CheckCircle, Wrench, AlertTriangle, Search \} from 'lucide-react';/g, "import { useState, useEffect } from 'react';\nimport { Plus, CheckCircle, Wrench, AlertTriangle, Search } from 'lucide-react';");

console.log('Fixed TS errors');
