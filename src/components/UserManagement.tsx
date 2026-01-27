import React, { useState, useMemo } from 'react';
import type { User } from '@/types/event-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Filter, Download, Eye, MapPin, Users, UserCheck, UserX, FileText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock user data - in production, this would come from API
const generateMockUsers = (count: number): User[] => {
  const profiles: Array<'family' | 'ultra' | 'vip' | 'standard'> = ['family', 'ultra', 'vip', 'standard'];
  const statuses: Array<'active' | 'inactive' | 'at_gate' | 'entered'> = ['active', 'inactive', 'at_gate', 'entered'];
  const gates = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `USER${String(i + 1).padStart(5, '0')}`,
    ticketId: `TKT-${String(i + 1).padStart(6, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    name: `Spectator ${i + 1}`,
    email: `user${i + 1}@example.com`,
    phone: `+212 6${Math.floor(Math.random() * 100000000)}`,
    profile: profiles[Math.floor(Math.random() * profiles.length)],
    assignedGate: gates[Math.floor(Math.random() * gates.length)],
    currentLocation: {
      lat: 33.5731 + (Math.random() - 0.5) * 0.01,
      lng: -7.5898 + (Math.random() - 0.5) * 0.01,
    },
    status: statuses[Math.floor(Math.random() * statuses.length)],
    scanTime: new Date(Date.now() - Math.random() * 3600000),
    lastUpdate: new Date(Date.now() - Math.random() * 600000),
    estimatedArrival: new Date(Date.now() + Math.random() * 1800000),
    path: [gates[Math.floor(Math.random() * gates.length)], gates[Math.floor(Math.random() * gates.length)]],
  }));
};

interface UserManagementProps {
  onUserSelect?: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onUserSelect }) => {
  const [users] = useState<User[]>(generateMockUsers(50));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [profileFilter, setProfileFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesProfile = profileFilter === 'all' || user.profile === profileFilter;
      
      return matchesSearch && matchesStatus && matchesProfile;
    });
  }, [users, searchTerm, statusFilter, profileFilter]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      atGate: users.filter(u => u.status === 'at_gate').length,
      entered: users.filter(u => u.status === 'entered').length,
    };
  }, [users]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    onUserSelect?.(user);
  };

  const getStatusBadge = (status: User['status']) => {
    const config = {
      active: { label: 'Active', className: 'bg-success/20 text-success border-success/30' },
      inactive: { label: 'Inactive', className: 'bg-muted/20 text-muted-foreground border-muted/30' },
      at_gate: { label: 'At Gate', className: 'bg-warning/20 text-warning border-warning/30' },
      entered: { label: 'Entered', className: 'bg-primary/20 text-primary border-primary/30' },
    };
    const { label, className } = config[status];
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getProfileBadge = (profile: User['profile']) => {
    const config = {
      vip: { label: 'VIP', className: 'bg-accent/20 text-accent' },
      ultra: { label: 'Ultra', className: 'bg-primary/20 text-primary' },
      family: { label: 'Family', className: 'bg-success/20 text-success' },
      standard: { label: 'Standard', className: 'bg-muted/20 text-muted-foreground' },
    };
    const { label, className } = config[profile];
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    try {
      if (filteredUsers.length === 0) {
        alert('No users to export');
        return;
      }

      const dataToExport = filteredUsers.map(user => ({
        'User ID': user.id,
        'Name': user.name || 'N/A',
        'Ticket ID': user.ticketId,
        'Email': user.email || 'N/A',
        'Phone': user.phone || 'N/A',
        'Profile': user.profile.toUpperCase(),
        'Assigned Gate': user.assignedGate,
        'Status': user.status.replace('_', ' ').toUpperCase(),
        'Latitude': user.currentLocation.lat.toFixed(6),
        'Longitude': user.currentLocation.lng.toFixed(6),
        'Scan Time': user.scanTime.toLocaleString(),
        'Last Update': user.lastUpdate.toLocaleString(),
        'Estimated Arrival': user.estimatedArrival?.toLocaleString() || 'N/A',
        'Path': user.path?.join(' → ') || 'N/A',
      }));

      const fileName = `event-flow-users-${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') {
        // Export as CSV
        const headers = Object.keys(dataToExport[0] || {});
        const csvContent = [
          headers.join(','),
          ...dataToExport.map(row => 
            headers.map(header => {
              const value = row[header as keyof typeof row];
              // Escape commas and quotes in CSV
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value || '';
            }).join(',')
          ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Export as Excel
        if (!XLSX || !XLSX.utils) {
          throw new Error('XLSX library not loaded');
        }
        
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
        
        // Auto-size columns
        const maxWidth = 30;
        const colWidths = Object.keys(dataToExport[0] || {}).map(key => ({
          wch: Math.min(maxWidth, Math.max(key.length, ...dataToExport.map(row => String(row[key as keyof typeof row] || '').length)))
        }));
        worksheet['!cols'] = colWidths;
        
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-success/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Active</p>
                <p className="text-2xl font-bold text-success">{stats.active}</p>
              </div>
              <UserCheck className="w-8 h-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-warning/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">At Gate</p>
                <p className="text-2xl font-bold text-warning">{stats.atGate}</p>
              </div>
              <MapPin className="w-8 h-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Entered</p>
                <p className="text-2xl font-bold text-primary">{stats.entered}</p>
              </div>
              <UserX className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="glass-card border-primary/30">
        <CardHeader>
          <CardTitle className="font-display text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, ticket, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="at_gate">At Gate</SelectItem>
                <SelectItem value="entered">Entered</SelectItem>
              </SelectContent>
            </Select>
            <Select value={profileFilter} onValueChange={setProfileFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Profiles</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="ultra">Ultra</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="w-[100px]">User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Gate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className={`cursor-pointer hover:bg-secondary/50 ${
                        selectedUser?.id === user.id ? 'bg-primary/10' : ''
                      }`}
                      onClick={() => handleUserClick(user)}
                    >
                      <TableCell className="font-mono text-xs">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="font-mono text-xs">{user.ticketId}</TableCell>
                      <TableCell>{getProfileBadge(user.profile)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Gate {user.assignedGate}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.currentLocation.lat.toFixed(4)}, {user.currentLocation.lng.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.lastUpdate.toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>

      {/* Selected User Details */}
      {selectedUser && (
        <Card className="glass-card border-primary/30">
          <CardHeader>
            <CardTitle className="font-display text-sm">User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Name</p>
                <p className="font-medium">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="font-medium text-sm">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                <p className="font-medium text-sm">{selectedUser.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Assigned Gate</p>
                <p className="font-medium">Gate {selectedUser.assignedGate}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Scan Time</p>
                <p className="font-medium text-sm">{selectedUser.scanTime.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Estimated Arrival</p>
                <p className="font-medium text-sm">
                  {selectedUser.estimatedArrival?.toLocaleTimeString() || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Path</p>
                <p className="font-medium text-sm">
                  {selectedUser.path?.join(' → ') || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Coordinates</p>
                <p className="font-medium text-xs font-mono">
                  {selectedUser.currentLocation.lat.toFixed(6)}, {selectedUser.currentLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;

