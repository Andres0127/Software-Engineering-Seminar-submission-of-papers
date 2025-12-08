import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Calendar, 
  ShoppingBag, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UserService, User, UserStatistics } from '../services/userService';
import toast from 'react-hot-toast';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'organizer' | 'buyer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log('Fetching users...');
        const usersData = await UserService.getUsers();
        console.log('Users data received:', usersData);
        console.log('Number of users:', usersData?.length || 0);
        
        if (!usersData || usersData.length === 0) {
          console.warn('No users found in response');
          setUsers([]);
          setFilteredUsers([]);
          setStatistics({
            totalUsers: 0,
            totalAdmins: 0,
            totalOrganizers: 0,
            totalBuyers: 0,
            activeUsers: 0,
            inactiveUsers: 0,
            suspendedUsers: 0,
          });
          return;
        }
        
        // Normalize users to ensure status and user_type are always set
        const normalizedUsers = usersData.map(u => {
          // Normalize status (Java uses uppercase, Python uses lowercase)
          const status = (u.status || 'ACTIVE').toString().toUpperCase();
          const normalizedStatus = status === 'ACTIVE' ? 'active' : 
                                   status === 'INACTIVE' ? 'inactive' : 
                                   status === 'SUSPENDED' ? 'suspended' : 'active';
          
          // Normalize user_type from role or userType
          let userType = u.user_type || u.userType?.toLowerCase();
          if (!userType && u.role) {
            // Convert ROLE_ADMIN -> admin, ROLE_ORGANIZER -> organizer, ROLE_BUYER -> buyer
            userType = u.role.replace('ROLE_', '').toLowerCase();
          }
          
          return {
            ...u,
            status: normalizedStatus as 'active' | 'inactive' | 'suspended',
            user_type: (userType || 'buyer') as 'admin' | 'organizer' | 'buyer',
            phone_number: u.phone_number || u.phoneNumber,
            organization_name: u.organization_name || u.organizationName,
            created_at: u.created_at || u.createdAt,
          };
        });
        console.log('Normalized users:', normalizedUsers);
        setUsers(normalizedUsers);
        setFilteredUsers(normalizedUsers);
        const stats = UserService.calculateStatistics(normalizedUsers);
        console.log('Statistics:', stats);
        setStatistics(stats);
      } catch (error: any) {
        console.error('Error loading users:', error);
        console.error('Error details:', error.response || error.message);
        toast.error(error.message || 'Error loading users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.organization_name && user.organization_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.user_type === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => (user.status || 'active') === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const getRoleIcon = (role: string | undefined) => {
    const normalizedRole = role || 'buyer';
    switch (normalizedRole) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'organizer':
        return <Calendar className="w-4 h-4" />;
      case 'buyer':
        return <ShoppingBag className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string | undefined) => {
    const normalizedRole = role || 'buyer';
    switch (normalizedRole) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'organizer':
        return 'bg-blue-100 text-blue-700';
      case 'buyer':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    const normalizedStatus = status || 'active';
    switch (normalizedStatus) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const getStatusBadgeColor = (status: string | undefined) => {
    const normalizedStatus = status || 'active';
    switch (normalizedStatus) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatRole = (role: string | undefined) => {
    const normalizedRole = role || 'buyer';
    return normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
  };

  const formatStatus = (status: string | undefined) => {
    const normalizedStatus = status || 'active';
    return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p style={{ color: '#4A4A4A' }}>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            User Management
          </h1>
          <p className="text-sm" style={{ color: '#4A4A4A' }}>
            Manage and monitor all users in the system
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 50%, #FF3399 100%)' }}>
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm mb-1" style={{ color: '#4A4A4A' }}>Total Users</p>
            <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              {statistics.totalUsers}
            </p>
          </div>

          <div className="card p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm mb-1" style={{ color: '#4A4A4A' }}>Administrators</p>
            <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              {statistics.totalAdmins}
            </p>
          </div>

          <div className="card p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm mb-1" style={{ color: '#4A4A4A' }}>Organizers</p>
            <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              {statistics.totalOrganizers}
            </p>
          </div>

          <div className="card p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-pink-600" />
              </div>
            </div>
            <p className="text-sm mb-1" style={{ color: '#4A4A4A' }}>Buyers</p>
            <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              {statistics.totalBuyers}
            </p>
          </div>
        </div>
      )}

      {/* Status Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#4A4A4A' }}>Active Users</p>
                <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                  {statistics.activeUsers}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#4A4A4A' }}>Inactive Users</p>
                <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                  {statistics.inactiveUsers}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#4A4A4A' }}>Suspended Users</p>
                <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                  {statistics.suspendedUsers}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5" style={{ color: '#0077FF' }} />
            <div className="text-left">
              <h3 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>Filter users</h3>
              <p className="text-sm" style={{ color: '#4A4A4A' }}>Search and filter users by role or status</p>
            </div>
          </div>
          {filtersOpen ? (
            <ChevronUp className="w-5 h-5" style={{ color: '#0077FF' }} />
          ) : (
            <ChevronDown className="w-5 h-5" style={{ color: '#0077FF' }} />
          )}
        </button>

        {filtersOpen && (
          <div className="px-6 pb-6 space-y-4 border-t" style={{ borderColor: '#D9DCE0' }}>
            <div className="pt-6">
              <label className="label mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#4A4A4A' }} />
                <input
                  type="text"
                  placeholder="Search by name, email, or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label mb-2">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="select"
                >
                  <option value="all">All roles</option>
                  <option value="admin">Administrator</option>
                  <option value="organizer">Organizer</option>
                  <option value="buyer">Buyer</option>
                </select>
              </div>

              <div>
                <label className="label mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="select"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b" style={{ borderColor: '#D9DCE0' }}>
          <h3 className="text-lg font-semibold" style={{ color: '#1A1A1A' }}>
            Users ({filteredUsers.length})
          </h3>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#D9DCE0' }} />
            <p className="text-lg font-semibold mb-2" style={{ color: '#1A1A1A' }}>No users found</p>
            <p style={{ color: '#4A4A4A' }}>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: '#D9DCE0', backgroundColor: '#F9FAFB' }}>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A4A4A' }}>
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A4A4A' }}>
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A4A4A' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A4A4A' }}>
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A4A4A' }}>
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A4A4A' }}>
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#D9DCE0' }}>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ background: 'linear-gradient(135deg, #0077FF 0%, #6A40FF 50%, #FF3399 100%)' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                            {user.name}
                          </div>
                          <div className="text-sm" style={{ color: '#4A4A4A' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.user_type || 'buyer')}`}>
                        {getRoleIcon(user.user_type || 'buyer')}
                        {formatRole(user.user_type || 'buyer')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        {formatStatus(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: user.organization_name ? '#1A1A1A' : '#4A4A4A' }}>
                        {user.organization_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: user.phone_number ? '#1A1A1A' : '#4A4A4A' }}>
                        {user.phone_number || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: '#4A4A4A' }}>
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

