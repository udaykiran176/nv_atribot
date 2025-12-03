'use client'
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Search, Copy, Download, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

interface Course { id: number; title: string }
interface LicenseKeyRow {
  id: string;
  key: string;
  courseId: number;
  used: boolean;
  assignedUserId: string | null;
  createdAt: string;
  courseTitle?: string;
}
const LicenseKeys = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [keys, setKeys] = useState<LicenseKeyRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [generateCount, setGenerateCount] = useState('1');
  const [generateCourse, setGenerateCourse] = useState<number | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [qrKey, setQrKey] = useState<LicenseKeyRow | null>(null);

  useEffect(() => {
    const load = async () => {
      const cs = await fetch('/api/courses', { cache: 'no-store' }).then(r => r.json()) as Course[];
      setCourses(cs);
      setGenerateCourse(cs[0]?.id ?? null);
      const ks = await fetch('/api/licenses', { cache: 'no-store' }).then(r => r.json()) as LicenseKeyRow[];
      setKeys(ks);
    };
    void load();
  }, []);

  const filteredKeys = keys.filter(key => {
    const matchesSearch = key.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === 'ALL' || String(key.courseId) === filterCourse;
    const matchesStatus = filterStatus === 'ALL' || 
      (filterStatus === 'used' && key.used) || 
      (filterStatus === 'unused' && !key.used);
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const handleGenerate = async () => {
    const count = parseInt(generateCount);
    if (!generateCourse) {
      toast('Please select a course.');
      return;
    }
    const res = await fetch('/api/licenses/generate', { method: 'POST', body: JSON.stringify({ courseId: generateCourse, count }) });
    if (res.ok) {
      const created = await res.json() as LicenseKeyRow[];
      setKeys([...created, ...keys]);
      setIsGenerateOpen(false);
      const courseTitle = courses.find(c => c.id === generateCourse)?.title || String(generateCourse);
      toast(`${count} new ${courseTitle} key(s) created.`);
    } else {
      toast('Failed to generate keys.');
    }
  };      

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast(  
          'License key copied to clipboard.',
    );
  };

  const handleExportCSV = () => {
    const csv = [
      'Key,Course,Status,Assigned To,Created At',
      ...filteredKeys.map(k => 
        `${k.key},${k.courseTitle || courses.find(c => c.id === k.courseId)?.title || k.courseId},${k.used ? 'Used' : 'Available'},${k.assignedUserId || ''},${k.createdAt}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'atribot-license-keys.csv';
    a.click();
    
    toast('License keys exported to CSV.');
  };

  return (
  
      <div className="space-y-6">
        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-4 justify-between"
        >
          <div className="flex flex-1 gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search keys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter by Course */}
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Courses</SelectItem>
                {courses.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter by Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="unused">Available</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
              <DialogTrigger asChild>
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Keys
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">Generate License Keys</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select value={generateCourse ? String(generateCourse) : ''} onValueChange={(v) => setGenerateCourse(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Keys</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={generateCount}
                      onChange={(e) => setGenerateCount(e.target.value)}
                    />
                  </div>
                  <Button variant="primary" className="w-full" onClick={handleGenerate}>
                    Generate {generateCount} Key(s)
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Keys Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>License Key</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKeys.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono">{row.key}</TableCell>
                      <TableCell>
                        <Badge>
                          {row.courseTitle || courses.find(c => c.id === row.courseId)?.title || row.courseId}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.used ? 'secondary' : 'default'}>
                          {row.used ? 'Used' : 'Available'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.assignedUserId || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleCopyKey(row.key)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setQrKey(row)}>
                            <QrCode className="w-4 h-4" />
                          </Button>
                          {!row.used && (
                            <Button
                              variant="ghost"
                              onClick={async () => {
                                const uid = prompt('Enter Clerk user ID') || ''
                                if (!uid) return
                                const res = await fetch('/api/licenses/assign', { method: 'POST', body: JSON.stringify({ key: row.key, userId: uid }) })
                                if (res.ok) {
                                  const updated = await res.json()
                                  setKeys(keys.map(k => (k.id === updated.id ? updated : k)))
                                  toast('License assigned to user.')
                                } else {
                                  toast('Failed to assign license.')
                                }
                              }}
                            >Assign</Button>
                          )}
                          {row.assignedUserId && (
                            <Button
                              variant="ghost"
                              onClick={async () => {
                                const res = await fetch('/api/licenses/deassign', { method: 'POST', body: JSON.stringify({ key: row.key }) })
                                if (res.ok) {
                                  const updated = await res.json()
                                  setKeys(keys.map(k => (k.id === updated.id ? updated : k)))
                                  toast('License deassigned.')
                                } else {
                                  const msg = await res.json().catch(() => ({}))
                                  toast(msg?.error || 'Failed to deassign license.')
                                }
                              }}
                            >Deassign</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* QR Code Dialog */}
        <Dialog open={!!qrKey} onOpenChange={() => setQrKey(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">Print QR Card</DialogTitle>
            </DialogHeader>
            {qrKey && (
              <div className="text-center space-y-4 py-4">
                <div className="bg-white p-4 rounded-xl inline-block">
                  <QRCodeSVG 
                    value={`${(process.env.NEXT_PUBLIC_PUBLIC_WEB_LINK || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '')}/kit_activation?key=${qrKey.key}`}
                    size={200}
                    level="H"
                  />
                </div>
                <div className="space-y-2">
                  <p className="font-mono text-lg">{qrKey.key}</p>
                  <Badge>
                    {courses.find(c => c.id === qrKey.courseId)?.title || qrKey.courseId}
                  </Badge>
                </div>
                <Button variant="outline" className="w-full" onClick={() => window.print()}>
                  Print Card
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  
  );
};

export default LicenseKeys;
